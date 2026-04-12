import { useEffect, useMemo, useState } from 'react';
import { appointmentsApi, doctorsApi, visitsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { toast } from 'sonner';
import { User, Calendar } from 'lucide-react';

function refToId(ref: unknown): string {
  if (ref == null) return '';
  if (typeof ref === 'object' && ref !== null && '_id' in ref) {
    return String((ref as { _id: unknown })._id);
  }
  return String(ref);
}

const SLOT_CONFLICT_TOAST =
  'This time slot is already booked for the selected doctor. Please choose a different time.';

function extractApiErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const m = data?.message;
  if (Array.isArray(m)) return m.join(' ');
  return typeof m === 'string' ? m : '';
}

function isAppointmentTimeSlotConflict(err: unknown): boolean {
  const res = (err as { response?: { status?: number; data?: { message?: string | string[] } } })?.response;
  if (!res) return false;
  const status = res.status ?? 0;
  const msg = extractApiErrorMessage(err).toLowerCase();
  if (status === 409) return true;
  if (msg.includes('already booked') || msg.includes('time slot')) return true;
  if ((status === 400 || status === 500) && (msg.includes('e11000') || msg.includes('duplicate key'))) return true;
  return false;
}

const UPCOMING_STATUSES = new Set(['pending', 'scheduled', 'pending_approval']);

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.linkedId) return;
    appointmentsApi.getByPatient(user.linkedId).then(r => setAppts(r.data)).catch(() => {});
  }, [user?.linkedId]);

  const upcoming = appts.filter(a => UPCOMING_STATUSES.has(a.status));
  const completed = appts.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">Welcome, {user?.name}</h2><p className="text-sm text-muted-foreground">Your health dashboard.</p></div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card"><CardContent className="pt-5 flex items-center gap-4"><User className="w-8 h-8 text-primary" /><div><div className="font-medium text-foreground">{user?.name}</div><div className="text-xs text-muted-foreground">{user?.email}</div></div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-warning">{upcoming.length}</div><div className="text-xs text-muted-foreground mt-1">Upcoming Appointments</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-success">{completed.length}</div><div className="text-xs text-muted-foreground mt-1">Past Visits</div></CardContent></Card>
      </div>
    </div>
  );
};

export const PatientAppointmentsPage = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '' });

  const loadAppointments = () => {
    if (!user?.linkedId) return;
    appointmentsApi.getByPatient(user.linkedId).then(r => setAppts(r.data)).catch(() => {});
  };

  useEffect(() => {
    loadAppointments();
  }, [user?.linkedId]);

  useEffect(() => {
    doctorsApi.getAll().then(r => setDoctors(r.data)).catch(() => {});
  }, []);

  const selectedDoctor = useMemo(
    () => doctors.find((d: { _id: string }) => String(d._id) === String(form.doctorId)),
    [doctors, form.doctorId],
  );

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.linkedId) {
      toast.error('You must be signed in to request an appointment.');
      return;
    }
    if (!form.doctorId || !form.date || !form.time) {
      toast.error('Please select a doctor, date, and time.');
      return;
    }
    const clinicId = refToId(selectedDoctor?.clinicId);
    if (!clinicId) {
      toast.error('Selected doctor has no department assigned.');
      return;
    }
    try {
      await appointmentsApi.create({
        patientId: user.linkedId,
        doctorId: form.doctorId,
        clinicId,
        date: form.date,
        time: form.time,
        status: 'pending_approval',
      });
      toast.success('Booking request sent. A receptionist will confirm it soon.');
      setForm({ doctorId: '', date: '', time: '' });
      loadAppointments();
    } catch (err: unknown) {
      if (isAppointmentTimeSlotConflict(err)) {
        toast.error(SLOT_CONFLICT_TOAST);
      } else {
        toast.error(extractApiErrorMessage(err) || 'Failed to submit booking request');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">My Appointments</h2></div>

      <Card className="shadow-card">
        <CardContent className="pt-6">
          <h3 className="font-display font-semibold text-foreground mb-1">Request an appointment</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Choose a doctor and time. Your request stays pending until staff approves it.
          </p>
          <form onSubmit={handleBookSubmit} className="space-y-4">
            <div>
              <Label>Doctor</Label>
              <Select value={form.doctorId} onValueChange={v => setForm(f => ({ ...f, doctorId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(d => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name} — {d.specialization || 'General'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDoctor ? (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Department: {selectedDoctor.clinicId?.name || '—'} · Available: {selectedDoctor.workingDays ?? '—'} · Hours:{' '}
                  {selectedDoctor.workingHours ?? '—'}
                </p>
              ) : null}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <DatePicker
                  value={form.date}
                  onChange={v => setForm(f => ({ ...f, date: v }))}
                  disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </div>
              <div>
                <Label>Time</Label>
                <TimePicker value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} />
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto gradient-primary border-0 text-primary-foreground">
              Submit booking request
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Doctor</th><th className="text-left py-2 font-medium hidden md:table-cell">Clinic</th><th className="text-left py-2 font-medium">Date</th><th className="text-left py-2 font-medium">Status</th></tr></thead>
            <tbody>
              {appts.map(a => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{a.doctorId?.name || '—'}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{a.clinicId?.name || '—'}</td>
                  <td className="py-2.5">{a.date} {a.time}</td>
                  <td className="py-2.5"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
              {appts.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No appointments.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export const PatientHistoryPage = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.linkedId) return;
    visitsApi.getByPatient(user.linkedId).then(r => setVisits(r.data)).catch(() => {});
  }, [user?.linkedId]);

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">Medical History</h2><p className="text-sm text-muted-foreground">Your visit records and diagnoses.</p></div>
      {visits.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">No medical records found.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {visits.map(v => (
            <Card key={v._id} className="shadow-card">
              <CardContent className="pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" />{v.date}</div>
                  <div className="text-sm text-muted-foreground">{v.doctorId?.name || '—'}</div>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{v.diagnosis}</h3>
                <p className="text-sm text-muted-foreground">{v.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
