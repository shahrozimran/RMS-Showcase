import assert from 'node:assert/strict'

const origin = process.env.CHECK_ORIGIN || 'http://127.0.0.1:3002'
const endpoint = `${origin}/api/interest`
const lead = {
  name: 'HTTP smoke test', email: 'test@example.com', restaurant: 'Example restaurant',
  phone: '', type: 'Restaurant', locations: 'One location', interests: ['Billing'],
  message: '', consent: true, website: 'honeypot-test', startedAt: Date.now() - 5000,
}
async function check(label, status, body, headers = {}) {
  const response = await fetch(endpoint, {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  assert.equal(response.status, status, `${label}: ${await response.text()}`)
  console.log(`PASS ${label} (${status})`)
}
await check('rejects another origin', 403, lead, { Origin: 'https://unrelated.example' })
await check('rejects cross-site requests', 403, lead, { 'Sec-Fetch-Site': 'cross-site' })
await check('rejects unsupported content', 415, lead, { 'Content-Type': 'text/plain' })
await check('rejects malformed JSON', 400, '{')
await check('requires contact consent', 400, { ...lead, consent: false })
await check('enforces body limit', 413, JSON.stringify({ message: 'x'.repeat(17000) }))
await check('discards honeypot without contacting email provider', 200, lead)
assert.equal((await fetch(endpoint)).status, 405)
for (const path of ['/', '/privacy', '/robots.txt', '/icon.svg', '/opengraph-image']) {
  const response = await fetch(`${origin}${path}`)
  assert.equal(response.status, 200, path)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  console.log(`PASS ${path} (200)`)
}
