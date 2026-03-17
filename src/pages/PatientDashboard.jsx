import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAppointmentsByPatient,
  getMedicalRecordsByPatient,
  getUsers,
  createAppointment,
} from '../services/authService'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [records, setRecords] = useState([])
  const [doctors, setDoctors] = useState([])

  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const appointmentDateTime = useMemo(() => {
    if (!date || !time) return ''
    return `${date} ${time}`
  }, [date, time])

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

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const [docs, appts, recs] = await Promise.all([
        getUsers(),
        getAppointmentsByPatient(user.id),
        getMedicalRecordsByPatient(user.id),
      ])

      setDoctors(docs.filter((d) => d.role === 'doctor'))
      setAppointments(appts)
      setRecords(recs)
    }

    load()
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('clinicUser')
    navigate('/login', { replace: true })
  }

  const handleBookAppointment = async (event) => {
    event.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!doctorId || !date || !time) {
      setFormError('Please select a doctor, date, and time.')
      return
    }

    const doctor = doctors.find((d) => String(d.id) === String(doctorId))
    if (!doctor) {
      setFormError('Selected doctor is not valid.')
      return
    }

    const newAppt = await createAppointment({
      patientId: user.id,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date,
      time,
    })

    setAppointments((prev) => [...prev, newAppt])
    setFormSuccess(`Appointment booked for ${appointmentDateTime} with ${doctor.name}.`)
    setDoctorId('')
    setDate('')
    setTime('')
  }

  return (
    <main style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h1>Patient Dashboard</h1>
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

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <section style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: 0, marginBottom: '0.75rem' }}>Medical Records</h2>
          {records.length ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
              {records.map((record) => (
                <li
                  key={record.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 12,
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    background: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <strong>{record.title}</strong>
                    <span style={{ color: '#64748b' }}>{record.date}</span>
                  </div>
                  <p style={{ margin: '0.5rem 0 0', color: '#475569' }}>{record.notes}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: '#64748b' }}>No medical records found.</p>
          )}
        </section>

        <section style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: 0, marginBottom: '0.75rem' }}>Book Appointment</h2>
            <form onSubmit={handleBookAppointment} style={{ display: 'grid', gap: '0.85rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span>Choose doctor</span>
                <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span>Date</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span>Time</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </label>

              {formError ? <p style={{ margin: 0, color: '#b91c1c' }}>{formError}</p> : null}
              {formSuccess ? <p style={{ margin: 0, color: '#047857' }}>{formSuccess}</p> : null}

              <button
                type="submit"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  border: 'none',
                  background: '#4f46e5',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Book appointment
              </button>
            </form>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: 0, marginBottom: '0.75rem' }}>Your Appointments</h2>
            {appointments.length ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                {appointments.map((appt) => (
                  <li
                    key={appt.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 12,
                      border: '1px solid rgba(148, 163, 184, 0.35)',
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <strong>{appt.doctorName}</strong>
                      <span style={{ color: '#64748b' }}>{appt.date}</span>
                    </div>
                    <p style={{ margin: '0.5rem 0 0', color: '#475569' }}>Time: {appt.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: '#64748b' }}>No appointments booked yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
