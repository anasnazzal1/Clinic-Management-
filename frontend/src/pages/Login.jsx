import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authenticate, setCurrentUser } from '../services/authService'

const ROLE_PATHS = {
  admin: '/admin',
  reception: '/reception',
  doctor: '/doctor',
  patient: '/patient',
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('clinicUser')
    if (!stored) return

    try {
      const user = JSON.parse(stored)
      if (user?.role && ROLE_PATHS[user.role]) {
        navigate(ROLE_PATHS[user.role], { replace: true })
      }
    } catch {
      // ignore invalid JSON
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const result = await authenticate(email, password)

    if (result.status === 'invalid') {
      setError('Invalid credentials')
      return
    }

    if (result.status === 'unverified') {
      setError('Please verify your email first')
      return
    }

    const user = result.user
    setCurrentUser(user)
    navigate(ROLE_PATHS[user.role] || '/', { replace: true })
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <p>Enter your email and password to continue.</p>

        <label className="form-label">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label className="form-label">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>

        {error ? <p className="error-message">{error}</p> : null}

        <button type="submit" className="primary-btn">
          Login
        </button>

        <p className="hint">
          Tip: use <strong>admin@test.com</strong> / <strong>1234</strong> (or any user from the mock data).
        </p>
      </form>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 60%, #38bdf8 100%);
          color: #111827;
        }

        .login-form {
          width: min(420px, 100%);
          padding: 2.25rem;
          border-radius: 16px;
          background: white;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
        }

        .login-form h1 {
          margin: 0 0 0.25rem;
          font-size: 1.75rem;
        }

        .login-form p {
          margin: 0 0 1.5rem;
          color: #475569;
        }

        .form-label {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .form-label input {
          padding: 0.75rem 0.85rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(15, 23, 42, 0.14);
          font-size: 1rem;
          outline: none;
        }

        .form-label input:focus {
          border-color: rgba(99, 102, 241, 0.75);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }

        .primary-btn {
          width: 100%;
          padding: 0.85rem;
          border: none;
          border-radius: 0.75rem;
          background: #4f46e5;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 120ms ease, background 120ms ease;
        }

        .primary-btn:hover {
          background: #4338ca;
          transform: translateY(-1px);
        }

        .error-message {
          margin: 0 0 1rem;
          color: #b91c1c;
          font-weight: 600;
        }

        .hint {
          margin-top: 1rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .hint strong {
          color: #0f172a;
        }
      `}</style>
    </main>
  )
}
