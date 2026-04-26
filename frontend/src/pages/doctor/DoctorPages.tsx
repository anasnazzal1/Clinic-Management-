import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi, doctorsApi, patientsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CalendarPlus, User, Stethoscope, Clock, Calendar,
  Search, X, CheckCircle2, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const listReq = user?.linkedId
      ? appointmentsApi.getByDoctor(user.linkedId)
      : appointmentsApi.getAll();

    listReq
      .then((r) => setAppts(r.data))
      .catch(() => toast.error('Unable to load appointments.'));

    // Fetch only this doctor's patients from the scoped backend endpoint
    patientsApi.getMy()
      .then((r) => setPatients(r.data))
      .catch(() => {});
  }, [user?.linkedId]);

  const filteredPatients = search.trim()
    ? patients.filter((p) =>
        (p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (p.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (p.phone ?? '').includes(search),
      )
    : patients;

  const pending = appts.filter((a) => a.status === 'pending');
  const completed = appts.filter((a) => a.status === 'completed');
  const cancelled = appts.filter((a) => a.status === 'cancelled');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Welcome, {user?.name}</h2>
        <p className="text-sm text-muted-foreground">Your appointment overview for today.</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-5 text-center">
            <div className="font-display text-3xl font-bold text-primary">{appts.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5 text-center">
            <div className="font-display text-3xl font-bold text-warning">{pending.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Pending</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5 text-center">
            <div className="font-display text-3xl font-bold text-success">{completed.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Completed</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5 text-center">
            <div className="font-display text-3xl font-bold text-destructive">{cancelled.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Cancelled</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            My Patients
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {filteredPatients.length} of {patients.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder="Search patients by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filteredPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {search ? 'No patients match your search.' : 'No patients yet.'}
            </p>
          ) : (
            <div className="divide-y">
              {filteredPatients.map((p) => (
                <button
                  key={p._id ?? p}
                  onClick={() => navigate(`/doctor/patients/${p._id ?? p}`)}
                  className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-muted/40 rounded-lg px-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">
                      {(p.name ?? '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {p.name ?? '�'}
                    </p>
                    {p.phone && <p className="text-xs text-muted-foreground truncate">{p.phone}</p>}
                  </div>
                  <User className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pending.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Patient</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Department</th>
                  <th className="text-left py-2 font-medium">Date & Time</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 5).map((a) => (
                  <tr key={a._id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium text-foreground">{a.patientId?.name || '�'}</td>
                    <td className="py-2.5 hidden md:table-cell text-muted-foreground">{a.clinicId?.name || '�'}</td>
                    <td className="py-2.5 text-muted-foreground">{a.date} � {a.time}</td>
                    <td className="py-2.5"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const DoctorAppointmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState<any[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpTarget, setFollowUpTarget] = useState<any>(null);
  const [followUpForm, setFollowUpForm] = useState({ date: '', time: '' });
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const listReq = user?.linkedId
      ? appointmentsApi.getByDoctor(user.linkedId)
      : appointmentsApi.getAll();

    listReq
      .then((r) => setAppts(r.data))
      .catch(() => toast.error('Unable to load appointments.'));

    if (user?.linkedId) {
      doctorsApi.getAll()
        .then((r) => {
          const me = r.data.find((d: any) => d._id === user.linkedId);
          setDoctorInfo(me ?? null);
        })
        .catch(() => {});
    }
  }, [user?.linkedId]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await appointmentsApi.update(cancelTarget._id, { status: 'cancelled' });
      setAppts((prev) => prev.map((a) =>
        a._id === cancelTarget._id ? { ...a, status: 'cancelled' } : a,
      ));
      toast.success('Appointment cancelled.');
    } catch {
      toast.error('Failed to cancel appointment.');
    } finally {
      setCancelTarget(null);
    }
  };

  const openFollowUp = (a: any) => {
    setFollowUpTarget(a);
    setFollowUpForm({ date: '', time: '' });
    setFollowUpOpen(true);
  };

  const handleSaveFollowUp = async () => {
    if (!followUpForm.date || !followUpForm.time) {
      toast.error('Date and time are required.');
      return;
    }

    const clash = appts.find((a) =>
      a.patientId?._id === (followUpTarget?.patientId?._id || followUpTarget?.patientId) &&
      a.date === followUpForm.date &&
      a.time === followUpForm.time &&
      a.status === 'pending'
    );

    if (clash) {
      toast.error('A pending appointment already exists for this patient at that date and time.');
      return;
    }

    setSavingFollowUp(true);
    try {
      const { data: created } = await appointmentsApi.create({
        patientId: followUpTarget.patientId?._id || followUpTarget.patientId,
        doctorId: user?.linkedId,
        clinicId: followUpTarget.clinicId?._id || followUpTarget.clinicId,
        date: followUpForm.date,
        time: followUpForm.time,
      });
      setAppts((prev) => [created, ...prev]);
      toast.success('Follow-up appointment booked.');
      setFollowUpOpen(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to book follow-up.');
    } finally {
      setSavingFollowUp(false);
    }
  };

  const appointments = appts.filter((a) =>
    !search || (a.patientId?.name ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const ActionButtons = ({ a }: { a: any }) => {
    if (a.status === 'pending') {
      return (
        <div className="flex items-center justify-end gap-1 flex-wrap">
          <Button
            size="sm"
            className="bg-success/15 text-success hover:bg-success/25 border-0 gap-1"
            onClick={() => navigate(`/visits/${a._id}/complete`)}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
            onClick={() => setCancelTarget(a)}
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => openFollowUp(a)}
          >
            <CalendarPlus className="w-3.5 h-3.5" /> Follow-up
          </Button>
        </div>
      );
    }

    if (a.status === 'completed') {
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => openFollowUp(a)}
          >
            <CalendarPlus className="w-3.5 h-3.5" /> Follow-up
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">My Appointments</h2>
        <p className="text-sm text-muted-foreground">Manage your appointments and patient follow-ups.</p>
      </div>

      {doctorInfo && (
        <Card className="shadow-card border-primary/20 bg-primary/5">
          <CardContent className="py-3 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Stethoscope className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{doctorInfo.specialization}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              {doctorInfo.workingDays} · {doctorInfo.workingHours}
            </span>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardContent className="pt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder="Search patients by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Patient</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Department</th>
                  <th className="text-left py-2 font-medium">Date & Time</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      {search ? 'No appointments match your search.' : 'No appointments found.'}
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => (
                    <tr
                      key={a._id}
                      className={`border-b last:border-0 transition-colors ${a.status === 'cancelled' ? 'opacity-50' : ''}`}
                    >
                      <td className="py-2.5">
                        <button
                          onClick={() => {
                            const pid = a.patientId?._id ?? a.patientId;
                            if (pid) {
                              navigate(`/doctor/patients/${pid}`);
                            } else {
                              toast.error('No patient record on this appointment.');
                            }
                          }}
                          className="font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          <User className="w-3.5 h-3.5" />
                          {a.patientId?.name || '?'}
                        </button>
                      </td>
                      <td className="py-2.5 hidden md:table-cell text-muted-foreground">{a.clinicId?.name || '?'}</td>
                      <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                        <div>{a.date}</div>
                        <div className="text-xs">{a.time}</div>
                      </td>
                      <td className="py-2.5"><StatusBadge status={a.status} /></td>
                      <td className="py-2.5"><ActionButtons a={a} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-display">
              Cancel appointment
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the selected appointment as cancelled and remove it from the pending queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelTarget(null)}>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>Cancel appointment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-base">Book follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground block">Date</label>
              <Input
                type="date"
                value={followUpForm.date}
                onChange={(e) => setFollowUpForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground block">Time</label>
              <Input
                type="time"
                value={followUpForm.time}
                onChange={(e) => setFollowUpForm((prev) => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowUpOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFollowUp} disabled={savingFollowUp}>
              {savingFollowUp ? 'Saving...' : 'Save follow-up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
