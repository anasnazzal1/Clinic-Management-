import { useState, useEffect, useMemo } from 'react';
import httpApi, { doctorsApi, clinicsApi, usersApi } from '@/lib/api';
import { validateCredentials, hasCredentialErrors, type CredentialErrors } from '@/lib/validateCredentials';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Search, Clock } from 'lucide-react';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { toast } from 'sonner';
import { TimePicker } from '@/components/ui/time-picker';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseDays(str: string): string[] {
  if (!str) return [];
  const rangeMatch = str.match(/^(\w+)\s*-\s*(\w+)$/);
  if (rangeMatch) {
    const start = ALL_DAYS.indexOf(rangeMatch[1]);
    const end = ALL_DAYS.indexOf(rangeMatch[2]);
    if (start !== -1 && end !== -1) return ALL_DAYS.slice(start, end + 1);
  }
  return str.split(/[,\s]+/).map(s => s.trim()).filter(s => ALL_DAYS.includes(s));
}

function parseTime(str: string): string {
  if (!str) return '';
  const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return str.includes(':') ? str : '';
  let h = parseInt(m[1]);
  const min = m[2];
  const period = m[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function buildHalfHourSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

const HALF_HOUR_SLOTS = buildHalfHourSlots();

/** Parse "HH:mm - HH:mm" or "9:00 AM - 5:00 PM" into 24h bounds. */
function parseWorkingHoursRange(workingHours: string): { min: string; max: string } | null {
  if (!workingHours?.trim()) return null;
  const parts = workingHours.split(/\s*-\s*/);
  if (parts.length !== 2) return null;
  const a = parseTime(parts[0].trim());
  const b = parseTime(parts[1].trim());
  if (!a || !b) return null;
  return a <= b ? { min: a, max: b } : { min: b, max: a };
}

function slotsBetweenInclusive(min: string, max: string): string[] {
  return HALF_HOUR_SLOTS.filter(t => t >= min && t <= max);
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const as = timeToMinutes(aStart);
  const ae = timeToMinutes(aEnd);
  const bs = timeToMinutes(bStart);
  const be = timeToMinutes(bEnd);
  return as < be && bs < ae;
}

function scheduleConflictsWithOther(
  formDays: string[],
  formStart: string,
  formEnd: string,
  other: { workingDays?: string; workingHours?: string },
): boolean {
  if (!formStart || !formEnd || formDays.length === 0) return false;
  const otherDays = parseDays(other.workingDays || '');
  if (otherDays.length === 0) return false;
  const daySet = new Set(otherDays);
  if (!formDays.some(d => daySet.has(d))) return false;
  const oh = (other.workingHours || '').split(/\s*-\s*/);
  if (oh.length !== 2) return false;
  const os = parseTime(oh[0].trim());
  const oe = parseTime(oh[1].trim());
  if (!os || !oe) return false;
  return rangesOverlap(formStart, formEnd, os, oe);
}

const emptyForm = {
  name: '', specialization: '', phone: '', email: '', clinicId: '',
  workingDays: [] as string[], startTime: '', endTime: '',
  username: '', password: '',
  linkedUserId: '',   // _id of the User document linked to this doctor
};

const DoctorsManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [credErrors, setCredErrors] = useState<CredentialErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [clinicDetail, setClinicDetail] = useState<{ workingDays: string; workingHours: string } | null>(null);

  const clinicBounds = useMemo(() => {
    if (!clinicDetail) return null;
    const allowedDaysParsed = parseDays(clinicDetail.workingDays || '');
    const displayDays =
      allowedDaysParsed.length > 0 ? ALL_DAYS.filter(d => allowedDaysParsed.includes(d)) : ALL_DAYS;
    const tw = parseWorkingHoursRange(clinicDetail.workingHours || '');
    return { displayDays, tw };
  }, [clinicDetail]);

  const clinicTimeSlots = useMemo(() => {
    if (!clinicBounds?.tw) return null;
    return slotsBetweenInclusive(clinicBounds.tw.min, clinicBounds.tw.max);
  }, [clinicBounds]);

  const clinicConstrainedTimes = !!(clinicTimeSlots && clinicTimeSlots.length > 0);

  useEffect(() => {
    if (!open) {
      setClinicDetail(null);
      return;
    }
    if (!form.clinicId) {
      setClinicDetail(null);
      return;
    }
    let cancelled = false;
    httpApi
      .get(`/clinics/${form.clinicId}`)
      .then(res => {
        if (cancelled) return;
        const c = (res.data as { data?: { workingDays?: string; workingHours?: string } })?.data;
        if (c) setClinicDetail({ workingDays: c.workingDays || '', workingHours: c.workingHours || '' });
        else setClinicDetail(null);
      })
      .catch(() => {
        if (!cancelled) setClinicDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, form.clinicId]);

  useEffect(() => {
    if (!open || !clinicBounds) return;
    const { displayDays, tw } = clinicBounds;
    setForm(f => {
      const wd = f.workingDays.filter(d => displayDays.includes(d));
      let st = f.startTime;
      let et = f.endTime;
      if (tw) {
        if (st && (st < tw.min || st > tw.max)) st = '';
        if (et && (et < tw.min || et > tw.max)) et = '';
        if (st && et && et <= st) et = '';
      }
      const wdKey = [...wd].sort().join(',');
      const prevWdKey = [...f.workingDays].sort().join(',');
      if (wdKey === prevWdKey && st === f.startTime && et === f.endTime) return f;
      return { ...f, workingDays: wd, startTime: st, endTime: et };
    });
  }, [clinicBounds, open]);

  const load = () => {
    doctorsApi.getAll().then(r => setData(r.data)).catch(() => {});
    clinicsApi.getAll().then(r => setClinics(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d: { name?: string }) => (d.name ?? '').toLowerCase().includes(q));
  }, [data, search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setCredErrors({}); setOpen(true); };
  const openEdit = async (d: any) => {
    const [startRaw, endRaw] = (d.workingHours || '').split(' - ');
    // Pre-fill doctor fields immediately so the dialog opens fast
    setEditing(d);
    setForm({
      name: d.name, specialization: d.specialization, phone: d.phone || '',
      email: d.email || '', clinicId: d.clinicId?._id || d.clinicId || '',
      workingDays: parseDays(d.workingDays || ''),
      startTime: parseTime(startRaw?.trim() || ''), endTime: parseTime(endRaw?.trim() || ''),
      username: '', password: '', linkedUserId: '',
    });
    setCredErrors({});
    setOpen(true);
    // Fetch linked user in background and fill username once resolved
    try {
      const { data: linkedUser } = await usersApi.getByLinkedId(d._id);
      if (linkedUser) {
        setForm(f => ({ ...f, username: linkedUser.username, linkedUserId: linkedUser._id }));
      }
    } catch { /* no linked user — leave fields empty */ }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.specialization.trim()) { toast.error('Name and specialization are required'); return; }
    if (form.startTime && form.endTime && form.endTime <= form.startTime) { toast.error('End time must be after start time'); return; }

    if (form.clinicId && form.workingDays.length > 0 && form.startTime && form.endTime) {
      try {
        const { data: peers } = await doctorsApi.getByClinic(form.clinicId);
        const selfId = editing?._id;
        const conflict = (peers as any[]).some(
          doc =>
            doc &&
            String(doc._id) !== String(selfId) &&
            scheduleConflictsWithOther(form.workingDays, form.startTime, form.endTime, doc),
        );
        if (conflict) {
          toast.error('Another doctor in this clinic already has this schedule. Please choose different hours.');
          return;
        }
      } catch {
        toast.error('Could not verify schedule conflicts.');
        return;
      }
    }

    if (!editing) {
      // Credentials are optional for doctors, but if either field is filled both must be valid
      const hasAny = !!(form.username || form.password);
      const errors = validateCredentials(form.username, form.password, hasAny);
      setCredErrors(errors);
      if (hasCredentialErrors(errors)) return;
    } else {
      // On edit: validate only if something was changed
      const usernameChanged = form.username !== (form.linkedUserId ? form.username : '');
      const hasAny = !!(form.password || usernameChanged);
      if (hasAny) {
        const errors = validateCredentials(form.username, form.password, false);
        setCredErrors(errors);
        if (hasCredentialErrors(errors)) return;
      }
    }

    const payload = {
      name: form.name, specialization: form.specialization, phone: form.phone,
      email: form.email, clinicId: form.clinicId || undefined,
      workingDays: form.workingDays.join(', '),
      workingHours: form.startTime && form.endTime ? `${form.startTime} - ${form.endTime}` : '',
    };
    try {
      if (editing) {
        const { data: updated } = await doctorsApi.update(editing._id, payload);
        setData(d => d.map(doc => doc._id === editing._id ? updated : doc));
        // Update linked user credentials if a user account exists
        if (form.linkedUserId) {
          const userPatch: Record<string, string> = {};
          if (form.username) userPatch.username = form.username;
          if (form.password) userPatch.password = form.password;
          if (Object.keys(userPatch).length > 0) {
            await usersApi.update(form.linkedUserId, userPatch);
          }
        }
        toast.success('Doctor updated');
      } else {
        await doctorsApi.create({
          ...payload,
          username: form.username,
          password: form.password,
        });
        await load();
        toast.success('Doctor added');
      }
      setOpen(false);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to save doctor'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await doctorsApi.delete(deleteTarget._id); setData(d => d.filter(doc => doc._id !== deleteTarget._id)); toast.success('Doctor deleted'); }
    catch { toast.error('Failed to delete doctor'); }
    finally { setDeleteTarget(null); }
  };

  const setField = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    if (key === 'username' || key === 'password') {
      setCredErrors(e => ({ ...e, [key]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="font-display text-2xl font-bold text-foreground">Doctors</h2><p className="text-sm text-muted-foreground">Manage doctor profiles and assignments.</p></div>
        <Button onClick={openAdd} className="gradient-primary border-0 text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Doctor</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Name</th><th className="text-left py-2 font-medium">Specialization</th><th className="text-left py-2 font-medium hidden md:table-cell">Department</th><th className="text-left py-2 font-medium hidden lg:table-cell">Schedule</th><th className="text-right py-2 font-medium">Actions</th></tr></thead>
            <tbody>
              {filteredData.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No doctors found.</td></tr>}
              {filteredData.map(d => (
                <tr key={d._id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{d.name}</td>
                  <td className="py-2.5 text-primary font-medium">{d.specialization}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{d.clinicId?.name || '—'}</td>
                  <td className="py-2.5 hidden lg:table-cell text-muted-foreground">{d.workingDays} • {d.workingHours}</td>
                  <td className="py-2.5 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(d)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit' : 'Add'} Doctor</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name</Label><Input value={form.name} onChange={e => setField('name', e.target.value)} /></div>
            <div><Label>Specialization</Label><Input value={form.specialization} onChange={e => setField('specialization', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setField('phone', e.target.value)} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setField('email', e.target.value)} /></div>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={form.clinicId} onValueChange={v => setForm(f => ({ ...f, clinicId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{clinics.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Working Days</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {(clinicBounds?.displayDays ?? ALL_DAYS).map(day => (
                  <div key={day} className="flex items-center gap-1.5">
                    <Checkbox id={`day-${day}`} checked={form.workingDays.includes(day)} onCheckedChange={checked => setForm(f => ({ ...f, workingDays: checked ? [...f.workingDays, day] : f.workingDays.filter(d => d !== day) }))} />
                    <label htmlFor={`day-${day}`} className="text-sm cursor-pointer">{day}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                {clinicConstrainedTimes ? (
                  <Select
                    value={form.startTime}
                    onValueChange={v =>
                      setForm(f => ({
                        ...f,
                        startTime: v,
                        endTime: f.endTime && f.endTime > v ? f.endTime : '',
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {clinicTimeSlots!.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <TimePicker value={form.startTime} onChange={v => setForm(f => ({ ...f, startTime: v }))} placeholder="Start time" />
                )}
              </div>
              <div>
                <Label>End Time</Label>
                {clinicConstrainedTimes ? (
                  <Select value={form.endTime} onValueChange={v => setForm(f => ({ ...f, endTime: v }))}>
                    <SelectTrigger className="w-full">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {clinicTimeSlots!.filter(t => !form.startTime || t > form.startTime).map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <TimePicker value={form.endTime} onChange={v => setForm(f => ({ ...f, endTime: v }))} placeholder="End time" minTime={form.startTime} />
                )}
              </div>
            </div>

            {editing ? (
              // ── Edit mode: show credentials section only if a linked user exists or after fetch
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-foreground mb-1">Login Credentials</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {form.linkedUserId
                      ? 'Username is pre-filled. Leave password empty to keep it unchanged.'
                      : 'No user account linked to this doctor yet.'}
                  </p>
                </div>
                {form.linkedUserId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Username</Label>
                      <Input
                        value={form.username}
                        onChange={e => setField('username', e.target.value)}
                        className={credErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {credErrors.username && (
                        <p className="text-xs text-destructive">{credErrors.username}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>New Password <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Input
                        type="password"
                        value={form.password}
                        onChange={e => setField('password', e.target.value)}
                        placeholder="Leave empty to keep current"
                        className={credErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {credErrors.password && (
                        <p className="text-xs text-destructive">{credErrors.password}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-foreground mb-1">Login Credentials <span className="text-muted-foreground font-normal">(optional)</span></p>
                  <p className="text-xs text-muted-foreground mb-3">If provided, both fields are required and must meet the rules below.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Username</Label>
                    <Input
                      value={form.username}
                      onChange={e => setField('username', e.target.value)}
                      className={credErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}
                      placeholder="min. 4 chars, no spaces"
                    />
                    {credErrors.username && (
                      <p className="text-xs text-destructive">{credErrors.username}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      className={credErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                      placeholder="min. 6 chars, letter + number"
                    />
                    {credErrors.password && (
                      <p className="text-xs text-destructive">{credErrors.password}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter><Button onClick={handleSave} className="gradient-primary border-0 text-primary-foreground">{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemLabel={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default DoctorsManagement;
