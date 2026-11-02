import { z } from 'zod'
import { createHash } from 'node:crypto'
import { interestOptions } from './form-options.ts'

export const interestSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80),
  email: z.email('Please enter a valid email address.').max(254),
  restaurant: z.string().trim().min(2, 'Please enter your restaurant or business name.').max(100),
  phone: z.string().trim().max(30).refine(value => !value || /^[+\d\s()\-]{7,30}$/.test(value), 'Please check your phone number.'),
  type: z.enum(['Restaurant', 'Café', 'Takeaway', 'Cloud kitchen', 'Other']),
  locations: z.enum(['One location', '2–5 locations', '6+ locations', 'Planning my first location']),
  interests: z.array(z.enum(interestOptions)).min(1).max(interestOptions.length),
  message: z.string().trim().max(1200),
  consent: z.literal(true, { error: 'Please allow us to contact you about this enquiry.' }),
  website: z.string().max(200),
  startedAt: z.number().int().positive(),
}).strict()

export type InterestSubmission = z.infer<typeof interestSchema>

const buckets = new Map<string, { count: number; until: number }>()
export function allowSubmission(client: string, now = Date.now()) {
  for (const [key, value] of buckets) if (value.until <= now) buckets.delete(key)
  const key = createHash('sha256').update(client).digest('hex')
  const bucket = buckets.get(key)
  if (bucket) { if (bucket.count >= 5) return false; bucket.count += 1; return true }
  if (buckets.size >= 2048) return false
  buckets.set(key, { count: 1, until: now + 10 * 60 * 1000 })
  return true
}
