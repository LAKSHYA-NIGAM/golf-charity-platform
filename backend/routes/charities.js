const express = require('express')
const { supabase } = require('../config/supabase')

const router = express.Router()

// GET /api/charities
router.get('/', async (req, res) => {
  try {
    const { search, category, limit = 20 } = req.query

    let query = supabase
      .from('charities')
      .select('id, name, category, description, website, total_raised, subscribers_count, featured, active, emoji')
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('total_raised', { ascending: false })
      .limit(parseInt(limit))

    if (category && category !== 'All') query = query.eq('category', category)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data: charities, error } = await query
    if (error) throw error

    res.json({ charities: charities || [] })
  } catch (err) {
    console.error('Get charities error:', err)
    res.status(500).json({ message: 'Failed to fetch charities' })
  }
})

// GET /api/charities/:id
router.get('/:id', async (req, res) => {
  try {
    const { data: charity, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', req.params.id)
      .eq('active', true)
      .single()

    if (error || !charity) return res.status(404).json({ message: 'Charity not found' })
    res.json({ charity })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch charity' })
  }
})

module.exports = router
