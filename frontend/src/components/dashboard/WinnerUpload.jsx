import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Trophy, Check, Clock, X } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending_upload: { label: 'Proof Required', color: '#d4a82a', badge: 'badge-gold', icon: Upload },
  pending_verification: { label: 'Under Review', color: '#80c080', badge: 'badge-green', icon: Clock },
  verified: { label: 'Verified', color: '#4da64d', badge: 'badge-green', icon: Check },
  paid: { label: 'Paid Out', color: '#d4a82a', badge: 'badge-gold', icon: Trophy },
  rejected: { label: 'Rejected', color: '#dc2626', badge: 'badge-red', icon: X },
}

function WinningCard({ winning, onUpload }) {
  const cfg = STATUS_CONFIG[winning.status] || STATUS_CONFIG.pending_upload
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
      style={{ marginBottom: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ color: '#f7f3ec', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{winning.draw_name}</p>
          <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13, fontFamily: '"DM Mono"' }}>
            {winning.match_type} — {new Date(winning.draw_date).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className={`badge ${cfg.badge}`} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon size={11} /> {cfg.label}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        <div>
          <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 11, fontFamily: '"DM Mono"', textTransform: 'uppercase' }}>Prize Amount</p>
          <p style={{ color: '#d4a82a', fontFamily: '"Playfair Display"', fontWeight: 900, fontSize: 28 }}>
            €{winning.prize_amount?.toLocaleString()}
          </p>
        </div>
        <div>
          <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 11, fontFamily: '"DM Mono"', textTransform: 'uppercase' }}>Numbers Matched</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {winning.matched_numbers?.map(n => (
              <div key={n} className="score-ball highlighted" style={{ width: 36, height: 36, fontSize: 13 }}>{n}</div>
            ))}
          </div>
        </div>
      </div>

      {winning.status === 'pending_upload' && (
        <div style={{ borderTop: '1px solid rgba(45,140,45,0.1)', paddingTop: 16 }}>
          <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13, marginBottom: 12 }}>
            Please upload a screenshot of your score card as proof of your result.
          </p>
          <button onClick={() => onUpload(winning.id)} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
            <Upload size={15} /> Upload Proof
          </button>
        </div>
      )}

      {winning.status === 'pending_verification' && (
        <div style={{ borderTop: '1px solid rgba(45,140,45,0.1)', paddingTop: 16 }}>
          <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 13 }}>
            Your proof has been submitted and is being reviewed by our team. Payouts are processed within 3–5 business days.
          </p>
        </div>
      )}

      {winning.status === 'paid' && (
        <div style={{ borderTop: '1px solid rgba(212,168,42,0.2)', paddingTop: 16, background: 'rgba(212,168,42,0.04)', borderRadius: '0 0 12px 12px', margin: '-24px -24px 0', padding: '16px 24px' }}>
          <p style={{ color: '#d4a82a', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={15} /> Payment of €{winning.prize_amount?.toLocaleString()} sent on {new Date(winning.paid_at).toLocaleDateString('en-IE')}
          </p>
        </div>
      )}
    </motion.div>
  )
}

function UploadModal({ winningId, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFile = (f) => {
    setFile(f)
    if (f && f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    }
  }

  const submit = async () => {
    if (!file) { toast.error('Please select a file'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('proof', file)
      await api.post(`/winnings/${winningId}/upload-proof`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Proof uploaded! We\'ll review within 48 hours.')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card p-8"
        style={{ maxWidth: 440, width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="display-heading" style={{ fontSize: 26, color: '#f7f3ec', marginBottom: 8 }}>Upload Proof</h3>
        <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: 14, marginBottom: 24 }}>
          Upload a screenshot of your score card or app showing your Stableford result.
        </p>

        <label style={{ display: 'block', cursor: 'pointer' }}>
          <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
          <div style={{
            border: '2px dashed rgba(45,140,45,0.3)', borderRadius: 12, padding: '32px 24px', textAlign: 'center',
            background: file ? 'rgba(45,140,45,0.06)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
          }}>
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxHeight: 160, borderRadius: 8, objectFit: 'contain', margin: '0 auto' }} />
            ) : (
              <>
                <Upload size={32} color="rgba(45,140,45,0.5)" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: 'rgba(247,243,236,0.5)', fontSize: 14 }}>Click to upload image or PDF</p>
                <p style={{ color: 'rgba(247,243,236,0.25)', fontSize: 12, marginTop: 4 }}>Max 10MB</p>
              </>
            )}
          </div>
        </label>

        {file && (
          <p style={{ color: '#4da64d', fontSize: 13, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={13} /> {file.name}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={submit} disabled={uploading || !file} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            {uploading ? 'Uploading…' : 'Submit Proof'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function WinnerUpload() {
  const [winnings, setWinnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadId, setUploadId] = useState(null)

  const fetchWinnings = () => {
    api.get('/winnings/my').then(r => setWinnings(r.data.winnings || [])).catch(() => {
      setWinnings([
        {
          id: 'w1', draw_name: 'January 2025 Draw', draw_date: '2025-01-31',
          match_type: '3-Match Win', prize_amount: 8875, status: 'pending_upload',
          matched_numbers: [14, 23, 31],
        },
        {
          id: 'w2', draw_name: 'October 2024 Draw', draw_date: '2024-10-31',
          match_type: '3-Match Win', prize_amount: 6200, status: 'paid',
          matched_numbers: [7, 19, 35], paid_at: '2024-11-04',
        },
      ])
    }).finally(() => setLoading(false))
  }

  useEffect(fetchWinnings, [])

  const totalWon = winnings.reduce((s, w) => w.status === 'paid' ? s + (w.prize_amount || 0) : s, 0)
  const pending = winnings.filter(w => ['pending_upload', 'pending_verification', 'verified'].includes(w.status))

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 className="display-heading" style={{ fontSize: 32, color: '#f7f3ec', marginBottom: 6 }}>My Winnings</h2>
        <p style={{ color: 'rgba(247,243,236,0.45)', fontSize: 15 }}>Track your prize wins and payment status</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Won', value: `€${totalWon.toLocaleString()}`, color: '#d4a82a' },
          { label: 'Pending Wins', value: pending.length, color: '#80c080' },
          { label: 'Total Draws', value: winnings.length, color: '#f7f3ec' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-5" style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(247,243,236,0.35)', fontSize: 11, fontFamily: '"DM Mono"', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
            <p style={{ color, fontFamily: '"Playfair Display"', fontWeight: 900, fontSize: 28 }}>{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        [1,2].map(i => <div key={i} className="shimmer" style={{ height: 140, borderRadius: 16, marginBottom: 16 }} />)
      ) : winnings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }} className="glass-card">
          <Trophy size={48} color="rgba(45,140,45,0.25)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(247,243,236,0.4)' }}>No winnings yet — keep entering draws!</p>
        </div>
      ) : (
        winnings.map(w => (
          <WinningCard key={w.id} winning={w} onUpload={setUploadId} />
        ))
      )}

      {uploadId && (
        <UploadModal winningId={uploadId} onClose={() => setUploadId(null)} onSuccess={fetchWinnings} />
      )}
    </div>
  )
}
