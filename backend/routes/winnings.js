const express = require('express')
const multer = require('multer')
const { supabase } = require('../config/supabase')
const { authenticate } = require('../middleware/auth')

const router = express.Router()
router.use(authenticate)

// Multer: store in memory before uploading to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only images and PDFs are allowed'))
    }
  },
})

// GET /api/winnings/my
router.get('/my', async (req, res) => {
  try {
    const { data: winnings, error } = await supabase
      .from('winnings')
      .select(`
        id, match_type, matched_numbers, prize_amount,
        status, proof_url, submitted_at, paid_at,
        draws!inner(name, draw_date)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const shaped = (winnings || []).map(w => ({
      ...w,
      draw_name: w.draws?.name,
      draw_date: w.draws?.draw_date,
    }))

    res.json({ winnings: shaped })
  } catch (err) {
    console.error('Get winnings error:', err)
    res.status(500).json({ message: 'Failed to fetch winnings' })
  }
})

// POST /api/winnings/:id/upload-proof
router.post('/:id/upload-proof', upload.single('proof'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    // Verify the winning belongs to this user and is pending upload
    const { data: winning, error: winError } = await supabase
      .from('winnings')
      .select('id, status, user_id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single()

    if (winError || !winning) {
      return res.status(404).json({ message: 'Winning record not found' })
    }
    if (winning.status !== 'pending_upload') {
      return res.status(400).json({ message: 'Proof already submitted or not required' })
    }

    // Upload to Supabase Storage
    const fileExt = req.file.mimetype === 'application/pdf' ? 'pdf' : 'jpg'
    const fileName = `proofs/${req.user.id}/${req.params.id}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return res.status(500).json({ message: 'File upload failed' })
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(fileName)

    // Update winning record
    const { error: updateError } = await supabase
      .from('winnings')
      .update({
        proof_url: publicUrl,
        status: 'pending_verification',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)

    if (updateError) throw updateError

    res.json({
      message: 'Proof uploaded successfully. We\'ll review within 48 hours.',
      proof_url: publicUrl,
    })
  } catch (err) {
    console.error('Upload proof error:', err)
    res.status(500).json({ message: err.message || 'Upload failed' })
  }
})

module.exports = router
