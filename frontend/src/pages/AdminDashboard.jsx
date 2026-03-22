import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from '../services/doctorsService'
import { getClinics } from '../services/clinicsService'
import { getPatients } from '../services/patientsService'
import { getAppointments } from '../services/appointmentsService'
import { getCurrentUser, logout } from '../services/authService'

const SIDEBAR_WIDTH = 280
const SECTIONS = [
  { key: 'overview', label: 'Dashboard Overview' },
  { key: 'clinics', label: 'Manage Clinics' },
  { key: 'doctors', label: 'Manage Doctors' },
  { key: 'patients', label: 'Manage Patients' },
  { key: 'reception', label: 'Manage Reception Staff' },
  { key: 'appointments', label: 'Appointments Management' },
  { key: 'records', label: 'Medical Records' },
]

const initialDoctorForm = {
  name: '',
  specialization: '',
  clinicId: '',
  schedule: [
    { day: 'Monday', start: '09:00', end: '13:00' },
    { day: 'Wednesday', start: '09:00', end: '13:00' },
  ],
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const [user, setUser] = useState(null)
  const [section, setSection] = useState('overview')

  const [clinics, setClinics] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])

  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm)
  const [doctorError, setDoctorError] = useState('')

  useEffect(() => {
    const current = getCurrentUser()
    if (!current || current.role !== 'admin') {
      navigate('/login', { replace: true })
      return
    }
    setUser(current)
  }, [navigate])

  useEffect(() => {
    const load = async () => {
      const [clinicList, doctorList, patientList, appointmentList] = await Promise.all([
        getClinics(),
        getDoctors(),
        getPatients(),
        getAppointments(),
      ])

      setClinics(clinicList)
      setDoctors(doctorList)
      setPatients(patientList)
      setAppointments(appointmentList)
    }

    load()
  }, [])

  const summary = useMemo(
    () => ({
      clinics: clinics.length,
      doctors: doctors.length,
      patients: patients.length,
      appointments: appointments.length,
    }),
    [clinics.length, doctors.length, patients.length, appointments.length],
  )

  function requireAdmin() {
    if (!user || user.role !== 'admin') {
      navigate('/login', { replace: true })
      return false
    }
    return true
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const openDoctorDialog = (doctor = null) => {
    setDoctorError('')
    setEditingDoctor(doctor)
    setDoctorForm(doctor ? { ...doctor } : initialDoctorForm)
    setDoctorDialogOpen(true)
  }

  const closeDoctorDialog = () => {
    setDoctorDialogOpen(false)
    setEditingDoctor(null)
    setDoctorForm(initialDoctorForm)
    setDoctorError('')
  }

  const handleDoctorChange = (field) => (event) => {
    const value = event.target.value
    setDoctorForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleScheduleChange = (index, key) => (event) => {
    const value = event.target.value
    setDoctorForm((prev) => {
      const schedule = [...(prev.schedule || [])]
      schedule[index] = { ...schedule[index], [key]: value }
      return { ...prev, schedule }
    })
  }

  const addScheduleRow = () => {
    setDoctorForm((prev) => ({
      ...prev,
      schedule: [...(prev.schedule || []), { day: 'Monday', start: '09:00', end: '13:00' }],
    }))
  }

  const removeScheduleRow = (index) => {
    setDoctorForm((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }))
  }

  const saveDoctor = async () => {
    setDoctorError('')

    if (!doctorForm.name.trim() || !doctorForm.specialization.trim() || !doctorForm.clinicId) {
      setDoctorError('Name, specialization and clinic are required.')
      return
    }

    try {
      if (editingDoctor) {
        const updated = await updateDoctor(editingDoctor.id, doctorForm)
        setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      } else {
        const created = await createDoctor(doctorForm)
        setDoctors((prev) => [...prev, created])
      }
      closeDoctorDialog()
    } catch (error) {
      setDoctorError(error?.message ?? 'Unable to save doctor.')
    }
  }

  const handleDeleteDoctor = async (doctor) => {
    const confirmed = window.confirm(`Delete ${doctor.name}? This cannot be undone.`)
    if (!confirmed) return

    await deleteDoctor(doctor.id)
    setDoctors((prev) => prev.filter((d) => d.id !== doctor.id))
  }

  const renderSection = () => {
    if (!requireAdmin()) return null

    if (section === 'overview') {
      return (
        <Grid container spacing={2}>
          {[
            { label: 'Total Clinics', value: summary.clinics, color: '#1e40af' },
            { label: 'Total Doctors', value: summary.doctors, color: '#047857' },
            { label: 'Total Patients', value: summary.patients, color: '#b45309' },
            { label: 'Total Appointments', value: summary.appointments, color: '#7c2d12' },
          ].map((card) => (
            <Grid key={card.label} item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    {card.label}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, color: card.color }}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )
    }

    if (section === 'doctors') {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Manage Doctors</Typography>
            <Button variant="contained" onClick={() => openDoctorDialog()}>
              Add doctor
            </Button>
          </Box>

          <TableContainer component={Box} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Clinic</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.map((doc) => {
                  const clinic = clinics.find((c) => c.id === doc.clinicId)
                  return (
                    <TableRow key={doc.id} hover>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell>{doc.specialization}</TableCell>
                      <TableCell>{clinic?.name ?? '—'}</TableCell>
                      <TableCell>
                        {doc.schedule?.map((slot, idx) => (
                          <Typography key={idx} variant="body2">
                            {slot.day} {slot.start}-{slot.end}
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openDoctorDialog(doc)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDeleteDoctor(doc)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={doctorDialogOpen} onClose={closeDoctorDialog} fullWidth maxWidth="sm">
            <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Name"
                    value={doctorForm.name}
                    onChange={handleDoctorChange('name')}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Specialization"
                    value={doctorForm.specialization}
                    onChange={handleDoctorChange('specialization')}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="clinic-select-label">Clinic</InputLabel>
                    <Select
                      labelId="clinic-select-label"
                      label="Clinic"
                      value={doctorForm.clinicId}
                      onChange={handleDoctorChange('clinicId')}
                    >
                      {clinics.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Schedule
                  </Typography>

                  {doctorForm.schedule?.map((slot, idx) => (
                    <Grid key={idx} container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Grid item xs={4} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel id={`day-label-${idx}`}>Day</InputLabel>
                          <Select
                            labelId={`day-label-${idx}`}
                            value={slot.day}
                            label="Day"
                            onChange={handleScheduleChange(idx, 'day')}
                          >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                              <MenuItem key={day} value={day}>
                                {day}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4} sm={3}>
                        <TextField
                          type="time"
                          label="Start"
                          value={slot.start}
                          onChange={handleScheduleChange(idx, 'start')}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={4} sm={3}>
                        <TextField
                          type="time"
                          label="End"
                          value={slot.end}
                          onChange={handleScheduleChange(idx, 'end')}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Button size="small" color="error" onClick={() => removeScheduleRow(idx)}>
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  ))}

                  <Button variant="outlined" onClick={addScheduleRow} sx={{ mt: 1 }}>
                    Add schedule row
                  </Button>
                </Grid>

                {doctorError ? (
                  <Grid item xs={12}>
                    <Typography color="error">{doctorError}</Typography>
                  </Grid>
                ) : null}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDoctorDialog}>Cancel</Button>
              <Button variant="contained" onClick={saveDoctor}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )
    }

    // Placeholder content for other sections
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        {section === 'clinics' && 'Manage Clinics (coming soon)'}
        {section === 'patients' && 'Manage Patients (coming soon)'}
        {section === 'reception' && 'Manage Reception Staff (coming soon)'}
        {section === 'appointments' && 'Appointments Management (coming soon)'}
        {section === 'records' && 'Medical Records (coming soon)'}
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap>
            Clinic Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {user?.name} ({user?.role})
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : undefined}
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            mt: isDesktop ? '64px' : 0,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Navigation
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {SECTIONS.map((item) => (
              <ListItemButton
                key={item.key}
                selected={section === item.key}
                onClick={() => setSection(item.key)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px', minHeight: '100vh' }}>
        {renderSection()}
      </Box>
    </Box>
  )
}
