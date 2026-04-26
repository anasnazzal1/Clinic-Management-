import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientsApi, visitsApi } from '@/lib/api';
import '@/print.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const IMPROVEMENT_LABELS: Record<string, { label: string; cls: string }> = {
  fully_recovered:        { label: 'Fully Recovered',        cls: 'print-badge-green'  },
  significant_improvement:{ label: 'Significant Improvement', cls: 'print-badge-blue'   },
  moderate_improvement:   { label: 'Moderate Improvement',   cls: 'print-badge-yellow' },
  no_improvement:         { label: 'No Improvement',         cls: 'print-badge-gray'   },
  worsened:               { label: 'Worsened Condition',     cls: 'print-badge-red'    },
};

const CASE_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  closed:                 { label: 'Case Closed',            cls: 'print-badge-green'  },
  monitoring:             { label: 'Under Monitoring',       cls: 'print-badge-yellow' },
  requires_consultation:  { label: 'Requires Consultation',  cls: 'print-badge-red'    },
};

function fmt(val?: string) {
  return val?.trim() || null;
}

function today() {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const PatientPrintPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [visits,  setVisits]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const didPrint = useRef(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([patientsApi.getOne(id), visitsApi.getByPatient(id)])
      .then(([p, v]) => {
        setPatient(p.data);
        setVisits(v.data ?? []);
      })
      .catch(() => setError('Failed to load patient data.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-print once data is ready
  useEffect(() => {
    if (!loading && patient && !didPrint.current) {
      didPrint.current = true;
      setTimeout(() => window.print(), 300);
    }
  }, [loading, patient]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
        Preparing report…
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#c00' }}>
        {error || 'Patient not found.'}
      </div>
    );
  }

  const doctorName = visits[0]?.doctorId?.name ?? '—';

  return (
    <>
      {/* ── Toolbar (hidden on print) ─────────────────────────────────────── */}
      <div className="no-print">
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid #cbd5e1',
            background: '#fff', cursor: 'pointer', fontSize: 13,
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          style={{
            padding: '6px 16px', borderRadius: 6, border: 'none',
            background: '#1a7f6e', color: '#fff', cursor: 'pointer', fontSize: 13,
            fontWeight: 600,
          }}
        >
          🖨 Print / Save as PDF
        </button>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          Use browser's "Save as PDF" option to download.
        </span>
      </div>

      {/* ── Printable report ─────────────────────────────────────────────── */}
      <div className="print-page">

        {/* Header */}
        <div className="print-header">
          <div>
            <div className="print-clinic-name">Outpatient Clinic</div>
            <div className="print-clinic-sub">Medical Center · Patient Medical Report</div>
          </div>
          <div className="print-report-label">
            <strong>Medical Report</strong>
            Date: {today()}<br />
            Patient ID: {String(patient._id).slice(-8).toUpperCase()}<br />
            Attending: {doctorName}
          </div>
        </div>

        {/* Patient Information */}
        <div className="print-section">
          <div className="print-section-title">Patient Information</div>
          <div className="print-info-grid">
            <div className="print-info-item">
              <label>Full Name</label>
              <span>{patient.name || '—'}</span>
            </div>
            <div className="print-info-item">
              <label>Age</label>
              <span>{patient.age ? `${patient.age} years` : '—'}</span>
            </div>
            <div className="print-info-item">
              <label>Gender</label>
              <span>{patient.gender || '—'}</span>
            </div>
            <div className="print-info-item">
              <label>Phone</label>
              <span>{patient.phone || '—'}</span>
            </div>
          </div>
        </div>

        {/* Visit Records */}
        <div className="print-section">
          <div className="print-section-title">
            Visit Records ({visits.length})
          </div>

          {visits.length === 0 ? (
            <p style={{ color: '#888', fontSize: 13 }}>No visit records found.</p>
          ) : (
            visits.map((v, i) => {
              const improvement = v.improvementStatus ? IMPROVEMENT_LABELS[v.improvementStatus] : null;
              const caseStatus  = v.caseStatus        ? CASE_STATUS_LABELS[v.caseStatus]        : null;

              return (
                <div key={v._id ?? i} className="print-visit">
                  {/* Visit header */}
                  <div className="print-visit-header">
                    <div className="print-visit-date">
                      Visit #{visits.length - i} &nbsp;·&nbsp; {v.date}
                    </div>
                    <div className="print-visit-doctor">
                      Dr. {v.doctorId?.name ?? '—'}
                      {v.doctorId?.specialization ? ` · ${v.doctorId.specialization}` : ''}
                    </div>
                  </div>

                  {/* Diagnosis — always shown, highlighted */}
                  <div className="print-field print-diagnosis">
                    <label>Diagnosis</label>
                    <p>{fmt(v.diagnosis) ?? 'Not recorded'}</p>
                  </div>

                  {/* Treatment / Prescription */}
                  {fmt(v.treatment) && (
                    <div className="print-field">
                      <label>Treatment / Prescription</label>
                      <p>{v.treatment}</p>
                    </div>
                  )}

                  {/* Improvement + Case Status row */}
                  {(improvement || caseStatus) && (
                    <div className="print-field">
                      <label>Assessment</label>
                      <p>
                        {improvement && (
                          <span className={`print-badge ${improvement.cls}`} style={{ marginRight: 8 }}>
                            {improvement.label}
                          </span>
                        )}
                        {caseStatus && (
                          <span className={`print-badge ${caseStatus.cls}`}>
                            {caseStatus.label}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Treatment Duration */}
                  {fmt(v.treatmentDuration) && (
                    <div className="print-field">
                      <label>Expected Treatment Duration</label>
                      <p>{v.treatmentDuration}</p>
                    </div>
                  )}

                  {/* Clinical Observations + Doctor Notes row */}
                  {(fmt(v.clinicalObservations) || fmt(v.notes)) && (
                    <div className="print-field-row">
                      {fmt(v.clinicalObservations) && (
                        <div className="print-field">
                          <label>Clinical Observations</label>
                          <p>{v.clinicalObservations}</p>
                        </div>
                      )}
                      {fmt(v.notes) && (
                        <div className="print-field">
                          <label>Doctor Notes</label>
                          <p>{v.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-up */}
                  {(fmt(v.followUpDate) || fmt(v.followUpActions)) && (
                    <div className="print-field-row">
                      {fmt(v.followUpDate) && (
                        <div className="print-field">
                          <label>Follow-up Date</label>
                          <p>{v.followUpDate}</p>
                        </div>
                      )}
                      {fmt(v.followUpActions) && (
                        <div className="print-field">
                          <label>Follow-up Actions</label>
                          <p>{v.followUpActions}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Medical Alerts */}
                  {fmt(v.medicalAlerts) && (
                    <div className="print-alert">
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9a3412', marginBottom: 4 }}>
                        ⚠ Medical Alerts
                      </label>
                      <p>{v.medicalAlerts}</p>
                    </div>
                  )}

                  {/* Remarks */}
                  {fmt(v.remarks) && (
                    <div className="print-field">
                      <label>Additional Remarks</label>
                      <p>{v.remarks}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="print-footer">
          <div className="print-signature">
            <div className="print-signature-line" />
            <span>Doctor's Signature</span>
          </div>
          <div className="print-footer-meta">
            Report generated: {today()}<br />
            This report is confidential and intended for medical use only.
          </div>
        </div>

      </div>
    </>
  );
};

export default PatientPrintPage;
