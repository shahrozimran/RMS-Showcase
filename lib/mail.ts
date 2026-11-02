import nodemailer from 'nodemailer'
import type { SendMailOptions } from 'nodemailer'
import { createHash } from 'node:crypto'
import { z } from 'zod'
import type { InterestSubmission } from './interest.ts'

export type MailConfig = { user: string; password: string; recipient: string }
type MailTransport = {
  sendMail: (message: SendMailOptions) => Promise<{
    accepted?: Array<string | { address: string }>
    rejected?: unknown[]
    messageId?: string
  }>
  isIdle?: () => boolean
}
export type DeliveryResult = { ok: true } | { ok: false; reason: 'not_configured' | 'busy' | 'rejected' | 'unavailable' }

export function mailConfig(): MailConfig {
  return {
    user: process.env.GMAIL_SMTP_USER?.trim() || 'aifunk63@gmail.com',
    password: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, ''),
    recipient: process.env.LEAD_EMAIL_TO?.trim() || 'aifunk63@gmail.com',
  }
}

function createGmailTransport(config: MailConfig) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: config.user, pass: config.password },
    pool: true, maxConnections: 2, maxMessages: 100, maxRequeues: 0,
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
    dnsTimeout: 5000, idleTimeout: 60000,
    disableFileAccess: true, disableUrlAccess: true,
    tls: { minVersion: 'TLSv1.2' },
  })
}

let cached: { fingerprint: string; transport: ReturnType<typeof createGmailTransport> } | undefined
function gmailTransport(config: MailConfig) {
  const fingerprint = createHash('sha256').update(`${config.user}\0${config.password}`).digest('hex')
  if (!cached || cached.fingerprint !== fingerprint) {
    cached?.transport.close()
    cached = { fingerprint, transport: createGmailTransport(config) }
  }
  return cached.transport
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)

export function renderInterestEmail(lead: InterestSubmission, origin: string) {
  const fields = [
    ['Name', lead.name], ['Email', lead.email], ['Restaurant / business', lead.restaurant],
    ['Phone', lead.phone || 'Not provided'], ['Business type', lead.type], ['Setup', lead.locations],
    ['Interested in', lead.interests.join(', ')],
    ['Message', lead.message || 'Please contact me for a personal RMS walkthrough.'],
    ['Contact consent', 'Visitor agreed to be contacted about this RMS enquiry.'],
    ['Showcase website', origin],
  ]
  const text = ['RMS Showcase — New walkthrough request', ...fields.map(([label, value]) => `${label}: ${value}`)].join('\n\n')
  const rows = fields.map(([label, value]) => `<tr><th align="left" style="width:155px;padding:14px 10px 14px 0;border-bottom:1px solid #e3eadc;vertical-align:top;font-size:13px;font-weight:600;color:#5a704e">${escapeHtml(label)}</th><td style="padding:14px 0;border-bottom:1px solid #e3eadc;vertical-align:top;font-size:14px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere;color:#263e2d">${escapeHtml(value)}</td></tr>`).join('')
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:24px 12px;background:#f3f6ed;font-family:Arial,sans-serif"><table role="presentation" style="width:100%;max-width:620px;margin:auto;border-collapse:collapse;background:#fff"><tr><td style="background:#173e31;padding:30px;color:#fff"><div style="font-size:26px;font-weight:700">RMS</div><p style="margin:10px 0 0;color:#d4e3c5;font-size:14px">A new conversation starts here.</p></td></tr><tr><td style="padding:30px"><p style="margin:0 0 10px;font-size:11px;letter-spacing:1px;color:#66814d">NEW WALKTHROUGH REQUEST</p><h1 style="margin:0 0 12px;font-size:25px;color:#173e31">Someone’s interested in RMS.</h1><p style="font-size:14px;color:#617456;line-height:1.7">Reply to this email to contact the person who submitted the enquiry.</p><table style="width:100%;border-collapse:collapse">${rows}</table><p style="margin-top:24px;font-size:11px;color:#748468;line-height:1.7">Sent directly by the RMS Showcase contact endpoint.</p></td></tr></table></body></html>`
  return { subject: 'RMS Showcase | New walkthrough request', text, html }
}

export async function deliverInterest(
  lead: InterestSubmission,
  origin: string,
  transport?: MailTransport,
  config: MailConfig = mailConfig(),
): Promise<DeliveryResult> {
  if (!config.password || !z.email().safeParse(config.user).success || !z.email().safeParse(config.recipient).success) {
    return { ok: false, reason: 'not_configured' }
  }
  try {
    const sender = transport || gmailTransport(config)
    if (sender.isIdle && !sender.isIdle()) return { ok: false, reason: 'busy' }
    const result = await sender.sendMail({
      from: { name: 'RMS Showcase', address: config.user },
      to: config.recipient,
      replyTo: { name: lead.name, address: lead.email },
      ...renderInterestEmail(lead, origin),
      disableFileAccess: true, disableUrlAccess: true,
    })
    const accepted = result.accepted?.some(value => (typeof value === 'string' ? value : value.address).toLowerCase() === config.recipient.toLowerCase())
    if (!accepted || result.rejected?.length) return { ok: false, reason: 'rejected' }
    return { ok: true }
  } catch {
    // SMTP errors can contain account addresses and authentication responses.
    // Return a fixed reason; never log the exception or message contents.
    return { ok: false, reason: 'unavailable' }
  }
}

export async function verifyGmailConnection(): Promise<DeliveryResult> {
  const config = mailConfig()
  if (!config.password || !z.email().safeParse(config.user).success || !z.email().safeParse(config.recipient).success) {
    return { ok: false, reason: 'not_configured' }
  }
  try {
    await gmailTransport(config).verify()
    return { ok: true }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}

export function closeMailTransport() {
  cached?.transport.close()
  cached = undefined
}
