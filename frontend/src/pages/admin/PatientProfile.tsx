import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { patientsApi, appointmentsApi, visitsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, User, Phone, MapPin, Calendar, Stethoscope } from 'lucide-react';

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      patientsApi.getOne(id),
      appointmentsApi.getByPatient(id),
      visitsApi.getByPatient(id),
    ]).then(([p, appts, vis]) => {
      setPatient(p.data);
      const visitsMap = new Map(vis.data.map((v: any) => [v.appointmentId?.toString?.() || v.appointmentId, v]));
      const rows = appts.data.map((a: any) => {
        const visit = visitsMap.get(a._id);
        return {
          id: a._id,
          date: a.date,
          time: a.time,
          doctor: a.doctorId,
          clinic: a.clinicId,
          status: a.status,
          diagnosis: visit?.diagnosis || a.diagnosis || '—',
          treatment: visit?.treatment || a.treatment || '—',
          notes: visit?.notes || a.notes || '—',
          clinicalObservations: visit?.clinicalObservations || '',
          medicalAlerts: visit?.medicalAlerts || '',
          followUpActions: visit?.followUpActions || '',
        };
      }).sort((a: any, b: any) => b.date.localeCompare(a.date));
      setTimeline(rows);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const filteredTimeline = useMemo(() => {
    return timeline.filter(row => {
      const matchesSearch = search
        ? [row.diagnosis, row.notes, row.doctor?.name, row.clinic?.name].join(' ').toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesDisease = diseaseFilter
        ? row.diagnosis.toLowerCase().includes(diseaseFilter.toLowerCase())
        : true;
      const afterFrom = fromDate ? row.date >= fromDate : true;
      const beforeTo = toDate ? row.date <= toDate : true;
      return matchesSearch && matchesDisease && afterFrom && beforeTo;
    });
  }, [timeline, search, diseaseFilter, fromDate, toDate]);

  const diseaseCounts = useMemo(() => {
    const counts = new Map<string, number>();
    filteredTimeline.forEach(row => {
      const key = row.diagnosis || 'Unknown';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredTimeline]);

  const visitsByMonth = useMemo(() => {
    const buckets = new Map<string, number>();
    filteredTimeline.forEach(row => {
      const month = row.date.slice(0, 7);
      buckets.set(month, (buckets.get(month) || 0) + 1);
    });
    return Array.from(buckets.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredTimeline]);

  const chronicConditions = patient?.chronicConditions || patient?.chronicDiseases || [];
  const allergies = patient?.allergies || [];
  const lastVisit = filteredTimeline[0];

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading...</div>;

  if (!patient) return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/patients')}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Patients</Button>
      <Card className="shadow-card"><CardContent className="py-16 text-center text-muted-foreground">Patient not found.</CardContent></Card>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/patients')}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Patients</Button>
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center"><User className="w-4 h-4 text-primary-foreground" /></div>
            {patient.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Age</p><p className="font-medium text-foreground">{patient.age} years</p></div>
            <div><p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Gender</p><p className="font-medium text-foreground">{patient.gender}</p></div>
            <div><p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Email</p><p className="font-medium text-foreground">{patient.email}</p></div>
            <div className="flex items-start gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Phone</p><p className="font-medium text-foreground">{patient.phone}</p></div></div>
            <div className="flex items-start gap-1.5 col-span-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Address</p><p className="font-medium text-foreground">{patient.address}</p></div></div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-primary" />
            Medical Record
            <span className="ml-auto text-sm font-normal text-muted-foreground">{filteredTimeline.length} record{filteredTimeline.length !== 1 ? 's' : ''}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-muted p-4 bg-card">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total visits</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{filteredTimeline.length}</p>
            </div>
            <div className="rounded-3xl border border-muted p-4 bg-card">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Last visit</p>
              <p className="mt-3 text-lg font-semibold text-foreground">{lastVisit ? `${lastVisit.date} · ${lastVisit.time}` : 'No visits yet'}</p>
              {lastVisit && <p className="mt-2 text-sm text-muted-foreground">{lastVisit.diagnosis}</p>}
            </div>
            <div className="rounded-3xl border border-muted p-4 bg-card">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chronic conditions</p>
              {chronicConditions.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {chronicConditions.map((condition: string) => (
                    <li key={condition} className="rounded-2xl bg-muted px-3 py-2">{condition}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">None documented.</p>
              )}
            </div>
            <div className="rounded-3xl border border-muted p-4 bg-card">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Allergies</p>
              {allergies.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {allergies.map((allergy: string) => (
                    <li key={allergy} className="rounded-2xl bg-muted px-3 py-2">{allergy}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No allergies listed.</p>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1">
              <TabsTrigger value="overview" className="rounded-full py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">Overview</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-full py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6 p-0 pt-4">
              <div className="grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
                <div className="space-y-4 rounded-3xl border border-muted p-4 bg-card">
                  <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Visit trends</h3>
                  <div className="space-y-3">
                    {visitsByMonth.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No monthly visit data available.</p>
                    ) : (
                      visitsByMonth.map(([month, count]) => (
                        <div key={month} className="space-y-1">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{month}</span>
                            <span>{count} visit{count !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, count * 14)}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-4 rounded-3xl border border-muted p-4 bg-card">
                  <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Common diagnoses</h3>
                  {diseaseCounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No diagnoses to summarize.</p>
                  ) : (
                    <div className="space-y-2">
                      {diseaseCounts.slice(0, 5).map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between text-sm">
                          <span>{name}</span>
                          <span className="font-medium text-foreground">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-muted p-4 bg-card">
                  <h3 className="font-display text-base font-semibold text-foreground">Latest visit summary</h3>
                  {lastVisit ? (
                    <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em]">Diagnosis</p>
                        <p className="text-foreground">{lastVisit.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em]">Treatment</p>
                        <p className="text-foreground">{lastVisit.treatment}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em]">Notes</p>
                        <p className="text-foreground">{lastVisit.notes}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No visit summary available yet.</p>
                  )}
                </div>
                <div className="rounded-3xl border border-muted p-4 bg-card">
                  <h3 className="font-display text-base font-semibold text-foreground">Medication history</h3>
                  <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                    {timeline.filter(row => row.treatment && row.treatment !== '—').slice(0, 4).map(row => (
                      <div key={row.id} className="rounded-2xl bg-muted p-3">
                        <p className="font-medium text-foreground">{row.date}</p>
                        <p>{row.treatment}</p>
                      </div>
                    ))}
                    {timeline.filter(row => row.treatment && row.treatment !== '—').length === 0 && (
                      <p>No medication entries recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="timeline" className="space-y-6 p-0 pt-4">
              <div className="grid gap-3 lg:grid-cols-[1fr,1fr]">
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visits" />
                <Input value={diseaseFilter} onChange={e => setDiseaseFilter(e.target.value)} placeholder="Filter by diagnosis" />
              </div>
              <div className="grid gap-3 lg:grid-cols-[1fr,1fr]">
                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
              {filteredTimeline.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No visits match the selected filters.</p>
              ) : (
                <Accordion type="single" collapsible className="space-y-3">
                  {filteredTimeline.map(row => (
                    <AccordionItem key={row.id} value={row.id} className="overflow-hidden rounded-3xl border border-muted bg-card">
                      <AccordionTrigger className="flex w-full items-center justify-between gap-3 px-4 py-4 text-sm font-medium text-foreground">
                        <div>
                          <p>{row.date} · {row.time}</p>
                          <p className="text-xs text-muted-foreground">{row.doctor?.name || '—'} · {row.clinic?.name || '—'}</p>
                        </div>
                        <StatusBadge status={row.status} />
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-muted/70 bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em]">Diagnosis</p>
                            <p className="text-foreground">{row.diagnosis}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em]">Treatment</p>
                            <p className="text-foreground">{row.treatment}</p>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em]">Notes</p>
                            <p className="text-foreground">{row.notes}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em]">Follow-up</p>
                            <p className="text-foreground">{row.followUpActions || row.medicalAlerts || 'None'}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;
