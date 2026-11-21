const { requireAdmin, requireActiveSubscription } = require('../middleware/auth')

describe('Auth Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = { user: null }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    next = jest.fn()
  })

  describe('requireAdmin', () => {
    test('calls next() when user has admin role', () => {
      req.user = { id: 'u1', role: 'admin' }
      requireAdmin(req, res, next)
      expect(next).toHaveBeenCalledTimes(1)
      expect(res.status).not.toHaveBeenCalled()
    })

    test('returns 403 when user has non-admin role', () => {
      req.user = { id: 'u2', role: 'subscriber' }
      requireAdmin(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Admin access required' })
      )
    })

    test('returns 403 when req.user is undefined', () => {
      req.user = undefined
      requireAdmin(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
    })
  })

  describe('requireActiveSubscription', () => {
    test('calls next() when user has active subscription', () => {
      req.user = { id: 'u1', subscription_status: 'active' }
      requireActiveSubscription(req, res, next)
      expect(next).toHaveBeenCalledTimes(1)
      expect(res.status).not.toHaveBeenCalled()
    })

    test('returns 403 when user subscription is canceled', () => {
      req.user = { id: 'u2', subscription_status: 'canceled' }
      requireActiveSubscription(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Active subscription required' })
      )
    })

    test('returns 403 when user subscription is past_due or pending', () => {
      req.user = { id: 'u3', subscription_status: 'pending' }
      requireActiveSubscription(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
    })
  })
})
