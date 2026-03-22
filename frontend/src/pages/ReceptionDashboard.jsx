import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function ReceptionDashboard() {
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

  const [appointments] = useState([
    {
      id: 1,
      patient: 'Maya Santoso',
      doctor: 'Dr. Amina Rahman',
      clinic: 'General Medicine',
      time: '09:30 AM',
      status: 'Checked In',
    },
    {
      id: 2,
      patient: 'Jonas Alvarez',
      doctor: 'Dr. Li Wei',
      clinic: 'Pediatrics',
      time: '10:00 AM',
      status: 'Waiting',
    },
    {
      id: 3,
      patient: 'Fatima Hassan',
      doctor: 'Dr. Samuel Okoro',
      clinic: 'Dermatology',
      time: '10:45 AM',
      status: 'Completed',
    },
  ])

  const [recentPatients] = useState([
    { id: 'P-101', name: 'Maya Santoso', registered: 'Mar 16, 2026' },
    { id: 'P-102', name: 'Jonas Alvarez', registered: 'Mar 16, 2026' },
    { id: 'P-103', name: 'Fatima Hassan', registered: 'Mar 15, 2026' },
  ])

  const stats = useMemo(
    () => ({
      todaysCount: appointments.length,
      newPatients: recentPatients.length,
    }),
    [appointments, recentPatients],
  )

  function handleAction(action) {
    alert(`Action: ${action}\n(placeholder — integrate with real flows.)`)
  }

  function handleLogout() {
    localStorage.removeItem('clinicUser')
    navigate('/login', { replace: true })
  }

  return (
    <div className="reception-dashboard">
      <aside className="reception-sidebar">
        <div className="reception-brand">
          <h2>Reception</h2>
          <p>Outpatient clinic</p>
        </div>

        <nav className="reception-nav">
          <NavLink to="/reception" className="nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/patients" className="nav-link">
            Patients
          </NavLink>
          <NavLink to="/appointments" className="nav-link">
            Appointments
          </NavLink>
          <NavLink to="/doctors-schedule" className="nav-link">
            Doctors Schedule
          </NavLink>
          <NavLink to="/chat" className="nav-link">
            Chat
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <small>Need help?</small>
          <Link to="/help">Contact support</Link>
        </div>
      </aside>

      <main className="reception-main">
        <header className="reception-header">
          <div>
            <h1>Reception Dashboard</h1>
            <p>Manage patients, appointments, and the front desk.</p>
            {user ? (
              <p style={{ margin: '0.75rem 0 0', color: '#475569' }}>
                Welcome, <strong>{user.name}</strong> <span style={{ opacity: 0.9 }}>({user.role})</span>
              </p>
            ) : null}
          </div>
          <div className="header-actions">
            <div className="header-stats">
              <div className="stat">
                <span className="stat-label">Today's Appts</span>
                <span className="stat-value">{stats.todaysCount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">New Patients</span>
                <span className="stat-value">{stats.newPatients}</span>
              </div>
            </div>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="card quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions">
            <button type="button" onClick={() => handleAction('Register New Patient')}>
              Register New Patient
            </button>
            <button type="button" onClick={() => handleAction('Book Appointment')}>
              Book Appointment
            </button>
            <button type="button" onClick={() => handleAction('View Doctor Schedule')}>
              View Doctor Schedule
            </button>
          </div>
        </section>

        <section className="card">
          <h2>Today's Appointments</h2>
          <div className="table-container">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Clinic</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.patient}</td>
                    <td>{appt.doctor}</td>
                    <td>{appt.clinic}</td>
                    <td>{appt.time}</td>
                    <td>
                      <span className={`status status-${appt.status.replace(/\s+/g, '').toLowerCase()}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2>Recent Patients</h2>
          <ul className="recent-list">
            {recentPatients.map((patient) => (
              <li key={patient.id} className="recent-item">
                <div>
                  <strong>{patient.name}</strong>
                  <span className="muted">{patient.id}</span>
                </div>
                <span className="muted">Registered {patient.registered}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <style>{`
        .reception-dashboard {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 100vh;
          gap: 1rem;
          background: #f5f7fb;
          color: #1f2937;
        }

        .reception-sidebar {
          padding: 1.5rem 1.25rem;
          background: #ffffff;
          border-right: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .reception-brand h2 {
          margin: 0;
          font-size: 1.4rem;
        }

        .reception-brand p {
          margin: 0.25rem 0 1.25rem;
          font-size: 0.9rem;
          color: #4b5563;
        }

        .reception-nav {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .nav-link {
          display: block;
          padding: 0.65rem 0.75rem;
          border-radius: 0.5rem;
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.15s ease;
        }

        .nav-link:hover {
          background: rgba(59, 130, 246, 0.08);
        }

        .nav-link.active {
          background: rgba(59, 130, 246, 0.18);
          color: #1e40af;
        }

        .sidebar-footer {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .sidebar-footer a {
          color: #2563eb;
          text-decoration: none;
        }

        .reception-main {
          padding: 1.5rem 1.75rem;
          overflow: auto;
        }

        .reception-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .reception-header h1 {
          margin: 0;
          font-size: 1.8rem;
        }

        .reception-header p {
          margin: 0.5rem 0 0;
          color: #4b5563;
        }

        .header-stats {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .logout-btn {
          border: 1px solid rgba(59, 130, 246, 0.7);
          border-radius: 0.75rem;
          background: rgba(59, 130, 246, 0.12);
          padding: 0.6rem 0.85rem;
          cursor: pointer;
          font-weight: 600;
          color: #1e3a8a;
        }

        .logout-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .stat {
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 0.75rem;
          min-width: 120px;
          text-align: center;
        }

        .stat-label {
          display: block;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .stat-value {
          display: block;
          font-size: 1.35rem;
          font-weight: 600;
        }

        .card {
          background: #ffffff;
          border-radius: 1rem;
          padding: 1.25rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          margin-bottom: 1.25rem;
        }

        .card h2 {
          margin-top: 0;
          margin-bottom: 0.9rem;
          font-size: 1.2rem;
        }

        .quick-actions .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .quick-actions button {
          flex: 1;
          min-width: 170px;
          padding: 0.7rem 0.85rem;
          border: 1px solid rgba(59, 130, 246, 0.7);
          border-radius: 0.75rem;
          background: rgba(59, 130, 246, 0.12);
          color: #1e40af;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.15s ease, transform 0.12s ease;
        }

        .quick-actions button:hover {
          background: rgba(59, 130, 246, 0.2);
          transform: translateY(-1px);
        }

        .table-container {
          overflow-x: auto;
        }

        .simple-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 520px;
        }

        .simple-table th,
        .simple-table td {
          padding: 0.75rem 0.85rem;
          text-align: left;
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
          font-size: 0.95rem;
        }

        .simple-table th {
          color: #4b5563;
          font-weight: 600;
        }

        .status {
          padding: 0.25rem 0.55rem;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .status-checkedin {
          background: rgba(34, 197, 94, 0.14);
          color: #166534;
        }

        .status-waiting {
          background: rgba(234, 179, 8, 0.14);
          color: #92400e;
        }

        .status-completed {
          background: rgba(59, 130, 246, 0.14);
          color: #1d4ed8;
        }

        .recent-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        }

        .recent-item:last-child {
          border-bottom: none;
        }

        .recent-item strong {
          display: block;
          color: #111827;
        }

        .recent-item .muted {
          color: #6b7280;
          font-size: 0.9rem;
        }

        @media (max-width: 900px) {
          .reception-dashboard {
            grid-template-columns: 1fr;
          }

          .reception-sidebar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
          }

          .reception-nav {
            flex-direction: row;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .reception-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-stats {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  )
}
