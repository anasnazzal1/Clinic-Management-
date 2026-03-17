import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { verifyToken } from '../services/authService'

export default function Verify() {
  const { token } = useParams()
  const [status, setStatus] = useState('pending')
  const [message, setMessage] = useState('Verifying your account...')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Verification token missing.')
      return
    }

    let cancelled = false

    async function run() {
      const user = await verifyToken(token)
      if (cancelled) return

      if (!user) {
        setStatus('error')
        setMessage('Invalid or expired verification link.')
        return
      }

      setStatus('success')
      setMessage('Your account has been successfully verified. You can now sign in.')
    }

    run()

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <main className="verify-page">
      <div className="verify-card">
        <h1>Account Verification</h1>
        <p>{message}</p>

        {status === 'success' ? (
          <Link to="/login" className="primary-btn">
            Go to login
          </Link>
        ) : (
          <Link to="/register" className="secondary-btn">
            Back to register
          </Link>
        )}
      </div>

      <style>{`
        .verify-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0ea5e9 0%, #4f46e5 60%, #9333ea 100%);
          color: #111827;
        }

        .verify-card {
          width: min(480px, 100%);
          padding: 2.25rem;
          border-radius: 16px;
          background: white;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
        }

        .verify-card h1 {
          margin: 0 0 0.5rem;
          font-size: 1.75rem;
        }

        .verify-card p {
          margin: 0 0 1.5rem;
          color: #475569;
        }

        .primary-btn,
        .secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.85rem;
          border-radius: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 120ms ease;
        }

        .primary-btn {
          background: #4f46e5;
          color: white;
        }

        .primary-btn:hover {
          background: #4338ca;
        }

        .secondary-btn {
          background: rgba(99, 102, 241, 0.12);
          color: #1e3a8a;
          border: 1px solid rgba(99, 102, 241, 0.35);
        }

        .secondary-btn:hover {
          background: rgba(99, 102, 241, 0.18);
        }
      `}</style>
    </main>
  )
}
