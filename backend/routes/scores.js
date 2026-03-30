const express = require('express')
const { z } = require('zod')
const { supabase } = require('../config/supabase')
const { authenticate, requireActiveSubscription } = require('../middleware/auth')

const router = express.Router()
router.use(authenticate)

const scoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  played_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  course_name: z.string().max(150).optional(),
})

// ─── GET /api/scores ─── Get user's current scores
router.get('/', async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from('scores')
      .select('id, score, played_at, course_name, created_at')
      .eq('user_id', req.user.id)
      .order('played_at', { ascending: false })
      .limit(5)

    if (error) throw error
    res.json({ scores: scores || [] })
  } catch (err) {
    console.error('Get scores error:', err)
    res.status(500).json({ message: 'Failed to fetch scores' })
  }
})

// ─── POST /api/scores ─── Add a new score (enforces max 5)
router.post('/', requireActiveSubscription, async (req, res) => {
  try {
    const body = scoreSchema.parse(req.body)

    // Count current scores
    const { count } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)

    // If already at 5, delete the oldest
    if (count >= 5) {
      const { data: oldest } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', req.user.id)
        .order('played_at', { ascending: true })
        .limit(1)
        .single()

      if (oldest) {
        await supabase.from('scores').delete().eq('id', oldest.id)
      }
    }

    // Insert new score
    const { data: score, error } = await supabase
      .from('scores')
      .insert({
        user_id: req.user.id,
        score: body.score,
        played_at: body.played_at,
        course_name: body.course_name || null,
      })
      .select('id, score, played_at, course_name, created_at')
      .single()

    if (error) throw error
    res.status(201).json({ score })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors })
    }
    console.error('Add score error:', err)
    res.status(500).json({ message: 'Failed to add score' })
  }
})

// ─── DELETE /api/scores/:id ───
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id) // Ensure user owns the score

    if (error) throw error
    res.json({ message: 'Score deleted' })
  } catch (err) {
    console.error('Delete score error:', err)
    res.status(500).json({ message: 'Failed to delete score' })
  }
})

module.exports = router
