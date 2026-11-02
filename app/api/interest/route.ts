import { NextRequest, NextResponse } from 'next/server'
import { allowSubmission, interestSchema } from '@/lib/interest'
import { deliverInterest } from '@/lib/mail'

export const runtime = 'nodejs'
export const maxDuration = 30
const reply = (body: Record<string, unknown>, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

async function readBody(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > 16384) throw new Error('BODY_LIMIT')
  const reader = request.body?.getReader()
  if (!reader) throw new SyntaxError('Missing body')
  let size = 0
  const chunks: Uint8Array[] = []
  while (true) {
    const part = await reader.read()
    if (part.done) break
    size += part.value.byteLength
    if (size > 16384) { await reader.cancel(); throw new Error('BODY_LIMIT') }
    chunks.push(part.value)
  }
  const buffer = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength }
  return JSON.parse(new TextDecoder().decode(buffer)) as unknown
}

export async function POST(request: NextRequest) {
  try {
    // Next's development server normalizes nextUrl to localhost even when the
    // browser uses 127.0.0.1. Match the actual request host in that case.
    const expectedOrigin = process.env.SITE_URL
      ? new URL(process.env.SITE_URL).origin
      : new URL(`${request.nextUrl.protocol}//${request.headers.get('host') || request.nextUrl.host}`).origin
    if (request.headers.get('origin') !== expectedOrigin || request.headers.get('sec-fetch-site') === 'cross-site') return reply({ error: 'Please submit this form from the showcase website.' }, 403)
    if (!request.headers.get('content-type')?.includes('application/json')) return reply({ error: 'Unsupported request format.' }, 415)
    const body = await readBody(request)
    const parsed = interestSchema.safeParse(body)
    if (!parsed.success) return reply({ error: parsed.error.issues[0]?.message || 'Please check your details.' }, 400)
    if (parsed.data.website) return reply({ ok: true }, 200)
    const age = Date.now() - parsed.data.startedAt
    if (age < 2000 || age > 7 * 24 * 60 * 60 * 1000) return reply({ error: 'Please take a moment to check your details, then try again.' }, 400)
    const client = process.env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for') || 'shared' : 'local'
    if (!allowSubmission(client)) return reply({ error: 'You have sent several enquiries. Please try again in a few minutes.' }, 429)
    const result = await deliverInterest(parsed.data, expectedOrigin)
    if (!result.ok) {
      console.error('Interest email delivery unavailable', { reason: result.reason })
      return reply({ error: 'We couldn’t send your enquiry just now. Please try again shortly, or email aifunk63@gmail.com.' }, 503)
    }
    return reply({ ok: true }, 200)
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: 'Please check the form and try again.' }, 400)
    if (error instanceof Error && error.message === 'BODY_LIMIT') return reply({ error: 'Your message is too long. Please shorten it and try again.' }, 413)
    console.error('Interest email request failed', { type: error instanceof Error ? error.name : 'Unknown' })
    return reply({ error: 'We couldn’t send your enquiry. Please try again, or email aifunk63@gmail.com.' }, 503)
  }
}
