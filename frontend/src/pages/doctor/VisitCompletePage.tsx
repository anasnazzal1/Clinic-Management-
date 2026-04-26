import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { appointmentsApi, visitsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

type Medication = {
  name: string;
  dosage: string;
};

const initialForm = {
  diagnosis: '',
  notes: '',
  medications: [{ name: '', dosage: '' }] as Medication[],
};

const formatMedicationSummary = (medications: Medication[]) =>
  medications
    .filter((item) => item.name.trim())
    .map((item) => `${item.name}${item.dosage ? ` ${item.dosage}` : ''}`)
    .join('; ');

const VisitCompletePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ diagnosis?: string }>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    appointmentsApi.getOne(id)
      .then((response) => {
        const apt = response.data;
        const doctorId = apt.doctorId?._id ?? apt.doctorId;
        if (doctorId !== user?.linkedId) {
          toast.error('You can only complete your own appointments.');
          navigate('/doctor/appointments');
          return;
        }
        setAppointment(apt);
      })
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error('You can only complete your own appointments.');
        } else {
          toast.error('Unable to load appointment details.');
        }
        navigate('/doctor/appointments');
      })
      .finally(() => setLoading(false));
  }, [id, user?.linkedId, navigate]);

  const handleAddMedication = () => {
    setForm((current) => ({
      ...current,
      medications: [...current.medications, { name: '', dosage: '' }],
    }));
  };

  const handleMedicationChange = (index: number, key: 'name' | 'dosage', value: string) => {
    setForm((current) => ({
      ...current,
      medications: current.medications.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const handleRemoveMedication = (index: number) => {
    setForm((current) => ({
      ...current,
      medications: current.medications.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!appointment) return;
    const validation: { diagnosis?: string } = {};
    if (!form.diagnosis.trim()) validation.diagnosis = 'Diagnosis is required.';
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    const patientId = appointment.patientId?._id ?? appointment.patientId;
    const doctorId = appointment.doctorId?._id ?? appointment.doctorId;
    const today = new Date().toISOString().split('T')[0];
    const treatment = formatMedicationSummary(form.medications);

    setSaving(true);
    try {
      await appointmentsApi.update(id, { status: 'completed' });
      await visitsApi.create({
        appointmentId: id,
        patientId,
        doctorId,
        date: today,
        diagnosis: form.diagnosis,
        treatment: treatment || undefined,
        notes: form.notes || undefined,
      });
      toast.success('Visit saved successfully.');
      navigate('/doctor/appointments');
    } catch {
      toast.error('Unable to save the visit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => navigate(-1);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <span className="text-sm text-muted-foreground">Simple visit completion</span>
      </div>

      <Card className="shadow-card border border-muted/80">
        <CardHeader className="border-b border-muted/80 pb-4">
          <CardTitle className="text-xl font-semibold">Complete Visit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-5">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Patient</div>
            <div>{appointment?.patientId?.name || 'Patient information unavailable'}</div>
            <div>{appointment?.date} · {appointment?.time}</div>
            <div>{appointment?.clinicId?.name || 'General clinic'}</div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Input
                value={form.diagnosis}
                onChange={(e) => {
                  setForm((current) => ({ ...current, diagnosis: e.target.value }));
                  setErrors((current) => ({ ...current, diagnosis: undefined }));
                }}
                placeholder="Enter the diagnosis"
                className={errors.diagnosis ? 'border-destructive focus-visible:ring-destructive' : ''}
                size="lg"
              />
              {errors.diagnosis && <p className="text-xs text-destructive">{errors.diagnosis}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Medications</Label>
                <Button size="sm" variant="outline" type="button" onClick={handleAddMedication}>
                  Add medication
                </Button>
              </div>
              <div className="space-y-3">
                {form.medications.map((med, index) => (
                  <div key={index} className="grid gap-3 sm:grid-cols-[1.5fr,1fr,auto]">
                    <Input
                      value={med.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      placeholder="Medication name"
                      size="lg"
                    />
                    <Input
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      placeholder="Dosage"
                      size="lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedication(index)}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                placeholder="Write quick clinical notes"
                rows={5}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="outline" onClick={goBack} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || loading} className="w-full sm:w-auto">
              {saving ? 'Saving...' : 'Save visit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitCompletePage;
