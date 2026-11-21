const { z } = require('zod')

const scoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  played_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  course_name: z.string().max(150).optional(),
})

const registerSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  charity_id: z.string().uuid().optional(),
  plan: z.enum(['monthly', 'yearly']).default('monthly'),
  extra_contribution: z.number().min(0).max(50).default(0),
})

describe('Input Validation Schemas', () => {
  describe('scoreSchema', () => {
    test('accepts valid score entry', () => {
      const valid = { score: 36, played_at: '2026-05-15', course_name: 'Pebble Beach' }
      expect(() => scoreSchema.parse(valid)).not.toThrow()
    })

    test('rejects score outside 1-45 range', () => {
      expect(() => scoreSchema.parse({ score: 0, played_at: '2026-05-15' })).toThrow()
      expect(() => scoreSchema.parse({ score: 46, played_at: '2026-05-15' })).toThrow()
    })

    test('rejects fractional scores', () => {
      expect(() => scoreSchema.parse({ score: 36.5, played_at: '2026-05-15' })).toThrow()
    })

    test('rejects invalid date format', () => {
      expect(() => scoreSchema.parse({ score: 36, played_at: '15-05-2026' })).toThrow()
      expect(() => scoreSchema.parse({ score: 36, played_at: 'invalid-date' })).toThrow()
    })
  })

  describe('registerSchema', () => {
    test('accepts valid registration payload', () => {
      const payload = {
        full_name: 'Tiger Woods',
        email: 'tiger@example.com',
        password: 'securepassword123',
      }
      const parsed = registerSchema.parse(payload)
      expect(parsed.plan).toBe('monthly')
      expect(parsed.extra_contribution).toBe(0)
    })

    test('rejects short passwords under 8 characters', () => {
      expect(() => registerSchema.parse({
        full_name: 'Tiger Woods',
        email: 'tiger@example.com',
        password: 'short',
      })).toThrow()
    })

    test('rejects invalid email addresses', () => {
      expect(() => registerSchema.parse({
        full_name: 'Tiger Woods',
        email: 'not-an-email',
        password: 'securepassword123',
      })).toThrow()
    })

    test('rejects invalid subscription plan', () => {
      expect(() => registerSchema.parse({
        full_name: 'Tiger Woods',
        email: 'tiger@example.com',
        password: 'securepassword123',
        plan: 'lifetime',
      })).toThrow()
    })
  })
})
