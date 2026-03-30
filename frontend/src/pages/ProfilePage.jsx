import React from 'react'
import { Navigate } from 'react-router-dom'

// Profile is handled inside DashboardPage at /dashboard/profile
export default function ProfilePage() {
  return <Navigate to="/dashboard/profile" replace />
}
