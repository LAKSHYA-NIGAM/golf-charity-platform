const { generateDrawNumbers, countMatches, calculatePrizes } = require('../services/drawEngine')

describe('Draw Engine - Core Lottery Calculations', () => {
  describe('generateDrawNumbers', () => {
    test('generates exactly 5 numbers', () => {
      const numbers = generateDrawNumbers()
      expect(Array.isArray(numbers)).toBe(true)
      expect(numbers).toHaveLength(5)
    })

    test('all numbers are between 1 and 45 inclusive', () => {
      for (let i = 0; i < 20; i++) {
        const numbers = generateDrawNumbers()
        numbers.forEach(num => {
          expect(Number.isInteger(num)).toBe(true)
          expect(num).toBeGreaterThanOrEqual(1)
          expect(num).toBeLessThanOrEqual(45)
        })
      }
    })

    test('all 5 numbers are unique', () => {
      for (let i = 0; i < 20; i++) {
        const numbers = generateDrawNumbers()
        const unique = new Set(numbers)
        expect(unique.size).toBe(5)
      }
    })

    test('numbers are sorted in ascending order', () => {
      const numbers = generateDrawNumbers()
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBeGreaterThan(numbers[i - 1])
      }
    })
  })

  describe('countMatches', () => {
    const drawNumbers = [7, 14, 21, 28, 35]

    test('returns 5 for complete match', () => {
      expect(countMatches([7, 14, 21, 28, 35], drawNumbers)).toBe(5)
    })

    test('returns 3 for 3-match tier', () => {
      expect(countMatches([7, 14, 21, 40, 42], drawNumbers)).toBe(3)
    })

    test('returns 0 when no numbers match', () => {
      expect(countMatches([1, 2, 3, 4, 5], drawNumbers)).toBe(0)
    })

    test('handles empty scores array', () => {
      expect(countMatches([], drawNumbers)).toBe(0)
    })
  })

  describe('calculatePrizes', () => {
    test('allocates 40% jackpot to single 5-match winner', () => {
      const totalPool = 10000
      const winners = [
        { userId: 'u1', name: 'Alice', matchCount: 5 },
      ]

      const prizes = calculatePrizes(totalPool, winners)
      expect(prizes.jackpot_won).toBe(true)
      expect(prizes['5-match']).toBe(4000)
    })

    test('splits 40% jackpot equally among multiple 5-match winners', () => {
      const totalPool = 10000
      const winners = [
        { userId: 'u1', name: 'Alice', matchCount: 5 },
        { userId: 'u2', name: 'Bob', matchCount: 5 },
      ]

      const prizes = calculatePrizes(totalPool, winners)
      expect(prizes.jackpot_won).toBe(true)
      expect(prizes['5-match']).toBe(2000)
    })

    test('rolls over 40% jackpot when there are no 5-match winners', () => {
      const totalPool = 10000
      const winners = [
        { userId: 'u1', name: 'Alice', matchCount: 4 },
      ]

      const prizes = calculatePrizes(totalPool, winners)
      expect(prizes.jackpot_won).toBe(false)
      expect(prizes.jackpot_rollover).toBe(4000)
    })

    test('splits 35% tier for 4-match and 25% tier for 3-match winners', () => {
      const totalPool = 10000
      const winners = [
        { userId: 'u1', name: 'Alice', matchCount: 4 },
        { userId: 'u2', name: 'Bob', matchCount: 4 },
        { userId: 'u3', name: 'Charlie', matchCount: 3 },
        { userId: 'u4', name: 'David', matchCount: 3 },
      ]

      const prizes = calculatePrizes(totalPool, winners)
      expect(prizes['4-match']).toBe(1750) // 3500 / 2
      expect(prizes['3-match']).toBe(1250) // 2500 / 2
    })
  })
})
