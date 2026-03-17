import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createVerificationToken, registerPatient } from '../services/authService'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [successToken, setSuccessToken] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccessToken('')

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const user = await registerPatient({ name, email, password, phone })
      const token = await createVerificationToken(user.id)
      setSuccessToken(token)
    } catch (err) {
      setError(err?.message ?? 'Unable to register')
    }
  }

  return (
    <main className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p>Register as a patient and start booking appointments.</p>

        <label className="form-label">
          <span>Full Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Jane Doe"
          />
        </label>

        <label className="form-label">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
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
            placeholder="••••••••"
          />
        </label>

        <label className="form-label">
          <span>Confirm Password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            placeholder="••••••••"
          />
        </label>

        <label className="form-label">
          <span>Phone <span style={{ opacity: 0.7 }}>(optional)</span></span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="(123) 456-7890"
          />
        </label>

        {error ? <p className="error-message">{error}</p> : null}

        <button type="submit" className="primary-btn">
          Register
        </button>

        {successToken ? (
          <div className="success">
            <p>
              Verification link has been sent to your email. (Simulated)
            </p>
            <p>
              <strong>Fake verification link:</strong>
            </p>
            <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
              {window.location.origin}/verify/{successToken}
            </pre>
            <button type="button" className="secondary-btn" onClick={() => navigate(`/verify/${successToken}`)}>
              Go verify now
            </button>
          </div>
        ) : null}
      </form>

      <style>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0ea5e9 0%, #4f46e5 60%, #9333ea 100%);
          color: #111827;
        }

        .register-form {
          width: min(480px, 100%);
          padding: 2.25rem;
          border-radius: 16px;
          background: white;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
        }

        .register-form h1 {
          margin: 0 0 0.25rem;
          font-size: 1.75rem;
        }

        .register-form p {
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

        .secondary-btn {
          margin-top: 0.75rem;
          width: 100%;
          padding: 0.85rem;
          border: 1px solid rgba(99, 102, 241, 0.75);
          border-radius: 0.75rem;
          background: white;
          cursor: pointer;
          font-weight: 600;
        }

        .secondary-btn:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .error-message {
          margin: 0 0 1rem;
          color: #b91c1c;
          font-weight: 600;
        }

        .success {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 0.75rem;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        pre {
          overflow-x: auto;
          margin: 0.5rem 0;
        }
      `}</style>
    </main>
  )
}
