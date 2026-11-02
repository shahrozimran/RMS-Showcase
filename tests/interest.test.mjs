import test from 'node:test'
import assert from 'node:assert/strict'
import { interestSchema, allowSubmission } from '../lib/interest.ts'
import { deliverInterest, renderInterestEmail } from '../lib/mail.ts'
import { orderTotals, initialCart } from '../lib/demo.ts'

const lead = {
  name: 'Showcase test', email: 'owner@example.com', restaurant: 'Example café', phone: '',
  type: 'Café', locations: 'One location', interests: ['A complete walkthrough'],
  message: 'Please explain the workflow.', consent: true, website: '', startedAt: Date.now() - 5000,
}

test('validates consent, field limits and allowed interests without accepting extra delivery fields', () => {
  assert.equal(interestSchema.safeParse(lead).success, true)
  for (const change of [
    { consent: false }, { email: 'invalid' }, { name: 'x' },
    { message: 'x'.repeat(1201) }, { interests: [] }, { interests: ['unknown'] },
    { phone: 'not a number' }, { recipient: 'other@example.com' },
  ]) assert.equal(interestSchema.safeParse({ ...lead, ...change }).success, false)
})

const config = { user: 'sender@gmail.com', password: 'test-only-not-a-real-password', recipient: 'inbox@example.com' }

test('sends to the configured inbox with a safe sender and visitor reply-to', async () => {
  let sent
  const transport = { sendMail: async message => {
    sent = message
    return { accepted: ['inbox@example.com'], rejected: [], messageId: 'test-message' }
  } }
  assert.deepEqual(await deliverInterest(lead, 'https://example.com', transport, config), { ok: true })
  assert.deepEqual(sent.from, { name: 'RMS Showcase', address: config.user })
  assert.equal(sent.to, config.recipient)
  assert.deepEqual(sent.replyTo, { name: lead.name, address: lead.email })
  assert.match(sent.text, /Example café/)
  assert.match(sent.text, /agreed/)
  assert.match(sent.text, /https:\/\/example.com/)
  assert.equal(sent.disableFileAccess, true)
  assert.equal(sent.disableUrlAccess, true)
  assert.equal(JSON.stringify(sent).includes(config.password), false)
})

test('never claims delivery without credentials, recipient acceptance or SMTP availability', async () => {
  let calls = 0
  const transport = { sendMail: async () => { calls++; return { accepted: [] } } }
  assert.deepEqual(await deliverInterest(lead, 'https://example.com', transport, { ...config, password: '' }), { ok: false, reason: 'not_configured' })
  assert.equal(calls, 0)
  assert.deepEqual(await deliverInterest(lead, 'https://example.com', transport, config), { ok: false, reason: 'rejected' })
  assert.deepEqual(await deliverInterest(lead, 'https://example.com', { sendMail: async () => { throw new Error(`SMTP auth failed: ${config.password}`) } }, config), { ok: false, reason: 'unavailable' })
  assert.deepEqual(await deliverInterest(lead, 'https://example.com', { sendMail: async () => ({ accepted: ['wrong@example.com'] }) }, config), { ok: false, reason: 'rejected' })
})

test('bounds SMTP queueing when the connection pool is busy', async () => {
  const result = await deliverInterest(lead, 'https://example.com', {
    isIdle: () => false,
    sendMail: async () => { throw new Error('Must not attempt a send') },
  }, config)
  assert.deepEqual(result, { ok: false, reason: 'busy' })
})

test('escapes visitor HTML while retaining plain text and a fixed subject', () => {
  const content = renderInterestEmail({ ...lead, name: '<img src=x onerror=alert(1)>', message: '<script>bad</script> & "notes"' }, 'https://example.com')
  assert.equal(content.html.includes('<script>bad</script>'), false)
  assert.equal(content.html.includes('<img src=x'), false)
  assert.match(content.html, /&lt;script&gt;bad&lt;\/script&gt; &amp; &quot;notes&quot;/)
  assert.match(content.text, /<script>bad<\/script>/)
  assert.equal(content.subject, 'RMS Showcase | New walkthrough request')
})

test('limits repeated enquiries per client and permits another client and an expired window', () => {
  const now = 1000
  for (let i = 0; i < 5; i++) assert.equal(allowSubmission('test-client', now), true)
  assert.equal(allowSubmission('test-client', now), false)
  assert.equal(allowSubmission('different-client', now), true)
  assert.equal(allowSubmission('test-client', now + 600000), true)
})

test('carries accurate cents and item counts through the demonstration', () => {
  const initial = orderTotals(initialCart)
  assert.equal(initial.subtotal, 1848)
  assert.equal(initial.tax, 92)
  assert.equal(initial.total, 1940)
  assert.equal(initial.count, 2)
  const empty = orderTotals({ burger: 0, salad: 0, lemonade: 0 })
  assert.equal(empty.total, 0)
  assert.equal(empty.lines.length, 0)
  assert.equal(orderTotals({ burger: 2, salad: 1, lemonade: 0 }).total, 4407)
})
