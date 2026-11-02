import { existsSync } from 'node:fs'
import { deliverInterest, verifyGmailConnection, mailConfig, closeMailTransport } from '../lib/mail.ts'

// Operator-only CLI. Never print credentials or the SMTP exception.
if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const send = process.argv.includes('--send')
const config = mailConfig()
if (!config.password) {
  console.error('Mail is not configured. Save GMAIL_APP_PASSWORD in .env.local; see README.md.')
  process.exitCode = 1
} else {
  const start = performance.now()
  try {
    const result = send
      ? await deliverInterest({
        name: 'RMS Showcase delivery test', email: config.recipient,
        restaurant: 'Delivery verification (test only)', phone: '', type: 'Restaurant',
        locations: 'One location', interests: ['A complete walkthrough'],
        message: 'This is a labelled test of the custom direct Gmail email integration. Please disregard as a sales lead.',
        consent: true, website: '', startedAt: Date.now() - 5000,
      }, process.env.SITE_URL || 'http://127.0.0.1:3002')
      : await verifyGmailConnection()
    console.log(JSON.stringify({ action: send ? 'delivery-test' : 'authentication-check', ...result, durationMs: Math.round(performance.now() - start) }))
    if (!result.ok) process.exitCode = 1
  } finally {
    closeMailTransport()
  }
}
