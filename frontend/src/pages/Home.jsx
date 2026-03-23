import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Link,
  Paper,
  Typography,
} from '@mui/material'
import { getClinics } from '../services/clinicsService'

export default function Home() {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getClinics().then((data) => {
      if (mounted) {
        setClinics(data || [])
        setLoading(false)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={0}>
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" justifyContent="space-between" py={1}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              Sunrise Outpatient Clinic
            </Typography>

            <Box display="flex" gap={1}>
              <Button component={RouterLink} to="/login" color="inherit">
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="secondary"
              >
                Register
              </Button>
            </Box>
          </Box>
        </Container>
      </AppBar>

      <Box component="section" py={8} bgcolor="#f5f7ff">
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom>
                Welcome to our Clinic
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Delivering compassionate outpatient care with modern tools and a friendly team.
                Schedule appointments, message your providers, and manage your care in one place.
              </Typography>
              <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                <Button component={RouterLink} to="/register" variant="contained" size="large">
                  Get Started
                </Button>
                <Button component={RouterLink} to="/login" variant="outlined" size="large">
                  Sign In
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://via.placeholder.com/640x380?text=Clinic+Care"
                alt="Clinic care"
                width="100%"
                borderRadius={2}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="section" py={8}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom>
            Our Clinics
          </Typography>

          {loading ? (
            <Typography>Loading clinics...</Typography>
          ) : (
            <Grid container spacing={3}>
              {clinics.map((clinic) => (
                <Grid item key={clinic.id} xs={12} md={6} lg={4}>
                  <Card elevation={3} sx={{ height: '100%' }}>
                    <CardHeader title={clinic.name} subheader={clinic.floor} />
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {clinic.description}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Doctors
                      </Typography>
                      {clinic.doctors && clinic.doctors.length ? (
                        <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                          {clinic.doctors.map((doctor) => (
                            <Box component="li" key={doctor.id} mb={0.75}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {doctor.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {doctor.specialization}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No doctors assigned yet.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Box component="section" py={8} bgcolor="#f5f7ff">
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom>
            Contact Us
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Address
                </Typography>
                <Typography>123 Healthway Blvd.</Typography>
                <Typography>Suite 200, Springfield, IL 62701</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Phone
                </Typography>
                <Typography>(555) 123-4567</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Email
                </Typography>
                <Link href="mailto:info@sunriseclinic.example" underline="hover">
                  info@sunriseclinic.example
                </Link>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="footer" py={4} bgcolor="#0f172a" color="#f8fafc">
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Sunrise Outpatient Clinic. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
