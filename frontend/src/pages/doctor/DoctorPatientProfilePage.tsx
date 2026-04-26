import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patientsApi, visitsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'sonner';

const DoctorPatientProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([patientsApi.getOne(id), visitsApi.getByPatient(id)])
      .then(([patientResponse, visitsResponse]) => {
        setPatient(patientResponse.data);
        setVisits(visitsResponse.data);
      })
      .catch(() => toast.error('Unable to load patient profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  const goBack = () => navigate('/doctor/appointments');

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Patient profile</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/doctor/patients/${id}/print`)}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Report
          </Button>
        </div>
      </div>

      <Card className="shadow-card border border-muted/80">
        <CardHeader className="border-b border-muted/80 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="w-5 h-5" />
            </span>
            {patient?.name || 'Patient details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-5">
          <div className="grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
            <div>
              <div className="text-xs uppercase tracking-[0.2em]">Age</div>
              <div className="mt-2 text-foreground">{patient?.age ? `${patient.age} years` : '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em]">Phone</div>
              <div className="mt-2 text-foreground">{patient?.phone || '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em]">Gender</div>
              <div className="mt-2 text-foreground">{patient?.gender || '—'}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-muted p-4 bg-card">
            <h2 className="text-base font-semibold text-foreground">Recent visits</h2>
            {loading ? (
              <p className="mt-4 text-sm text-muted-foreground">Loading visits…</p>
            ) : visits.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No visits found for this patient.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {visits.map((visit) => {
                  const isExpanded = expandedVisitId === String(visit._id);
                  return (
                    <div key={visit._id} className="rounded-3xl border border-muted/80 bg-white p-4">
                      <button
                        type="button"
                        onClick={() => setExpandedVisitId(isExpanded ? null : String(visit._id))}
                        className="flex w-full items-start justify-between gap-4 text-left"
                      >
                        <div>
                          <div className="font-medium text-foreground">{visit.date}</div>
                          <div className="text-sm text-muted-foreground mt-1">{visit.diagnosis || 'No diagnosis recorded'}</div>
                        </div>
                        <div className="text-sm text-primary">{isExpanded ? 'Hide' : 'Details'}</div>
                      </button>
                      {isExpanded && (
                        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em]">Notes</div>
                            <p className="mt-1 text-foreground">{visit.notes || 'No notes available'}</p>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em]">Treatment</div>
                            <p className="mt-1 text-foreground">{visit.treatment || 'No treatment recorded'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPatientProfilePage;
