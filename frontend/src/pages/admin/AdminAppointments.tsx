import { useState, useEffect, useCallback, useMemo } from 'react';
import httpApi, { appointmentsApi, patientsApi, doctorsApi, clinicsApi, visitsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge, AppointmentStatus } from '@/components/StatusBadge';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Plus, Pencil, Trash2, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

interface Appointment {
  _id: string;
  patientId: { _id: string; name: string } | null;
  doctorId: { _id: string; name: string; specialization: string } | null;
  clinicId: { _id: string; name: string } | null;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  diagnosis?: string;
}

const STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'completed', 'cancelled', 'deleted'];

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending:   'bg-warning/15 text-warning border-warning/30',
  completed: 'bg-success/15 text-success border-success/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
  deleted:   'bg-muted text-muted-foreground border-border',
};

const SLOT_CONFLICT_TOAST =
  'This time slot is already booked for the selected doctor. Please choose a different time.';

function extractApiErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const m = data?.message;
  if (Array.isArray(m)) return m.join(' ');
  return typeof m === 'string' ? m : '';
}

/** True when the server response indicates a doctor/date/time double-booking. */
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

const emptyForm = {
  patientId: '', clinicId: '', doctorId: '',
  date: '', time: '', status: 'pending' as AppointmentStatus,
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients]         = useState<any[]>([]);
  const [clinics, setClinics]           = useState<any[]>([]);
  const [allDoctors, setAllDoctors]     = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);

  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editing, setEditing]         = useState<Appointment | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);

  const [clinicScheduleLine, setClinicScheduleLine] = useState('');
  const [bookedTimesForDay, setBookedTimesForDay] = useState<string[]>([]);

  const selectedDoctor = useMemo(
    () => filteredDoctors.find((d: { _id: string }) => String(d._id) === String(form.doctorId)),
    [filteredDoctors, form.doctorId],
  );

  useEffect(() => {
    if (!form.clinicId) {
      setClinicScheduleLine('');
      return;
    }
    let cancelled = false;
    httpApi
      .get(`/clinics/${form.clinicId}`)
      .then(res => {
        if (cancelled) return;
        const c = (res.data as { data?: { workingDays?: string; workingHours?: string } })?.data;
        if (c) {
          setClinicScheduleLine(
            `Working Days: ${c.workingDays ?? '—'} | Hours: ${c.workingHours ?? '—'}`,
          );
        } else setClinicScheduleLine('');
      })
      .catch(() => {
        if (!cancelled) setClinicScheduleLine('');
      });
    return () => {
      cancelled = true;
    };
  }, [form.clinicId]);

  useEffect(() => {
    if (!form.date || !form.doctorId) {
      setBookedTimesForDay([]);
      return;
    }
    let cancelled = false;
    appointmentsApi
      .getAll()
      .then(r => {
        if (cancelled) return;
        const list = r.data || [];
        const times = list
          .filter((a: Appointment) => {
            if (editing && a._id === editing._id) return false;
            const did = a.doctorId?._id ?? (a.doctorId as unknown as string | undefined);
            return String(did) === String(form.doctorId) && a.date === form.date && a.status !== 'cancelled' && a.status !== 'deleted';
          })
          .map(a => a.time)
          .filter(Boolean);
        setBookedTimesForDay([...new Set(times)].sort());
      })
      .catch(() => {
        if (!cancelled) setBookedTimesForDay([]);
      });
    return () => {
      cancelled = true;
    };
  }, [form.date, form.doctorId, editing?._id]);

  // ── Load reference data once ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([patientsApi.getAll(), clinicsApi.getAll(), doctorsApi.getAll()])
      .then(([p, c, d]) => {
        setPatients(p.data);
        setClinics(c.data);
        setAllDoctors(d.data);
      })
      .catch(() => toast.error('Failed to load reference data'));
  }, []);

  // ── Load appointments ─────────────────────────────────────────────────────
  const loadAppointments = useCallback(() => {
    setLoading(true);
    appointmentsApi.getAll()
      .then(r => setAppointments(r.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // ── Filter doctors when clinic changes ────────────────────────────────────
  useEffect(() => {
    setFilteredDoctors(
      form.clinicId
        ? allDoctors.filter(d => {
            const cid = typeof d.clinicId === 'object' ? d.clinicId?._id : d.clinicId;
            return cid === form.clinicId;
          })
        : allDoctors,
    );
  }, [form.clinicId, allDoctors]);

  // ── Derived list (search + status filter) ────────────────────────────────
  const displayed = appointments.filter(a => {
    const matchSearch =
      !search ||
      (a.patientId?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.doctorId?.name  ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.clinicId?.name  ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Dialog helpers ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: Appointment) => {
    setEditing(a);
    setForm({
      patientId:  a.patientId?._id  ?? '',
      clinicId:   a.clinicId?._id   ?? '',
      doctorId:   a.doctorId?._id   ?? '',
      date:       a.date,
      time:       a.time,
      status:     a.status,
    });
    setDialogOpen(true);
  };

  // ── Save (create or update) ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.patientId || !form.doctorId || !form.clinicId || !form.date || !form.time) {
      toast.error('Patient, doctor, department, date and time are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updatedPayload = {
          patientId: form.patientId,
          doctorId: form.doctorId,
          clinicId: form.clinicId,
          date: form.date,
          time: form.time,
          status: form.status,
        };
        const { data: updated } = await appointmentsApi.update(editing._id, updatedPayload);
        setAppointments(prev => prev.map(a => a._id === editing._id ? updated : a));
        // If status changed to completed, create a visit record
        if (form.status === 'completed' && editing.status !== 'completed') {
          await maybeCreateVisit(updated);
        }
        toast.success('Appointment updated');
      } else {
        const { data: created } = await appointmentsApi.create({
          patientId: form.patientId,
          doctorId: form.doctorId,
          clinicId: form.clinicId,
          date: form.date,
          time: form.time,
        });
        setAppointments(prev => [created, ...prev]);
        toast.success('Appointment created');
      }
      setDialogOpen(false);
    } catch (e: unknown) {
      if (isAppointmentTimeSlotConflict(e)) {
        toast.error(SLOT_CONFLICT_TOAST);
      } else {
        toast.error(extractApiErrorMessage(e) || 'Failed to save appointment');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Quick status change from table ────────────────────────────────────────
  const handleStatusChange = async (a: Appointment, newStatus: AppointmentStatus) => {
    try {
      const { data: updated } = await appointmentsApi.update(a._id, { status: newStatus });
      setAppointments(prev => prev.map(x => x._id === a._id ? { ...x, status: newStatus } : x));
      if (newStatus === 'completed' && a.status !== 'completed') {
        await maybeCreateVisit(updated);
      }
      toast.success(`Status changed to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Soft delete ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await appointmentsApi.delete(deleteTarget._id);
      setAppointments(prev => prev.map(x => x._id === deleteTarget._id ? { ...x, status: 'deleted' as AppointmentStatus } : x));
      toast.success('Appointment marked as deleted');
    } catch {
      toast.error('Failed to delete appointment');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Auto-create visit when status → completed ─────────────────────────────
  const maybeCreateVisit = async (appt: any) => {
    try {
      const pid = appt.patientId?._id ?? appt.patientId;
      const did = appt.doctorId?._id  ?? appt.doctorId;
      await visitsApi.create({
        appointmentId: appt._id,
        patientId:     pid,
        doctorId:      did,
        date:          appt.date,
        notes:         '',
        diagnosis:     '',
      });
    } catch {
      // Visit creation is best-effort; don't block the UI
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Appointments</h2>
          <p className="text-sm text-muted-foreground">Full lifecycle management for all appointments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadAppointments} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={openCreate} className="gradient-primary border-0 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> New Appointment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search patient, doctor, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          {loading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading appointments...
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Patient</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Doctor</th>
                  <th className="text-left py-2 font-medium hidden lg:table-cell">Department</th>
                  <th className="text-left py-2 font-medium">Date & Time</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No appointments found.
                    </td>
                  </tr>
                )}
                {displayed.map(a => (
                  <tr key={a._id} className={`border-b last:border-0 ${a.status === 'deleted' ? 'opacity-50' : ''}`}>
                    <td className="py-2.5 font-medium text-foreground">{a.patientId?.name ?? '—'}</td>
                    <td className="py-2.5 hidden md:table-cell text-muted-foreground">
                      <div>{a.doctorId?.name ?? '—'}</div>
                      <div className="text-xs text-primary">{a.doctorId?.specialization}</div>
                    </td>
                    <td className="py-2.5 hidden lg:table-cell text-muted-foreground">{a.clinicId?.name ?? '—'}</td>
                    <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                      <div>{a.date}</div>
                      <div className="text-xs">{a.time}</div>
                    </td>
                    <td className="py-2.5">
                      {/* Inline status dropdown */}
                      <select
                        value={a.status}
                        disabled={a.status === 'deleted'}
                        onChange={e => handleStatusChange(a, e.target.value as AppointmentStatus)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed ${STATUS_STYLES[a.status]}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 text-right space-x-1">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => openEdit(a)}
                        disabled={a.status === 'deleted'}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setDeleteTarget(a)}
                        disabled={a.status === 'deleted'}
                        className="text-destructive hover:text-destructive"
                        title="Soft delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Patient */}
            <div>
              <Label>Patient</Label>
              <Select value={form.patientId} onValueChange={v => setForm(f => ({ ...f, patientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div>
              <Label>Department</Label>
              <Select
                value={form.clinicId}
                onValueChange={v => setForm(f => ({ ...f, clinicId: v, doctorId: '' }))}
              >
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {clinics.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {clinicScheduleLine ? (
                <p className="text-xs text-muted-foreground mt-1.5">{clinicScheduleLine}</p>
              ) : null}
            </div>

            {/* Doctor */}
            <div>
              <Label>Doctor</Label>
              <Select value={form.doctorId} onValueChange={v => setForm(f => ({ ...f, doctorId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {filteredDoctors.map(d => (
                    <SelectItem key={d._id} value={d._id}>{d.name} — {d.specialization}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDoctor ? (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Available: {(selectedDoctor as { workingDays?: string }).workingDays ?? '—'} | Hours:{' '}
                  {(selectedDoctor as { workingHours?: string }).workingHours ?? '—'}
                </p>
              ) : null}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <DatePicker
                  value={form.date}
                  onChange={v => setForm(f => ({ ...f, date: v }))}
                />
                {form.date && form.doctorId ? (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {bookedTimesForDay.length === 0
                      ? 'No other bookings for this doctor on this date.'
                      : `Booked times: ${bookedTimesForDay.join(', ')}`}
                  </p>
                ) : null}
              </div>
              <div>
                <Label>Time</Label>
                <TimePicker
                  value={form.time}
                  onChange={v => setForm(f => ({ ...f, time: v }))}
                />
              </div>
            </div>

            {/* Status (edit only) */}
            {editing && (
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={v => setForm(f => ({ ...f, status: v as AppointmentStatus }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gradient-primary border-0 text-primary-foreground"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemLabel={`appointment for ${deleteTarget?.patientId?.name ?? 'this patient'}`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminAppointments;
