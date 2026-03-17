import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('clinicUser')
    if (!stored) {
      navigate('/login', { replace: true })
      return
    }

    try {
      const parsed = JSON.parse(stored)
      if (!parsed?.role) throw new Error('Invalid user')
      setUser(parsed)
    } catch {
      localStorage.removeItem('clinicUser')
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('clinicUser')
    navigate('/login', { replace: true })
  }

  return (
    <main style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h1>Doctor Dashboard</h1>
          <p>
            {user ? (
              <>
                Welcome, <strong>{user.name}</strong> <span style={{ color: '#6b7280' }}>({user.role})</span>
              </>
            ) : (
              'Loading…'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 8,
            border: '1px solid rgba(107, 114, 128, 0.35)',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      <section style={{ marginTop: '2rem' }}>
        <p>View your upcoming appointments, patient charts, and messages.</p>
      </section>
    </main>
  )
}
