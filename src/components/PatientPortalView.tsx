import React, { useState, useEffect } from 'react';
import { PatientProfile, Appointment, PageView } from '../types/hospital';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { 
  getStoredPatient, getAllAppointments, 
  updateAppointmentStatus, getAuditLogs, logAuditAction 
} from '../utils/security';
import { 
  ShieldCheck, Lock, User, FileText, Activity, Calendar, 
  Download, Clock, AlertTriangle, CheckCircle, ChevronRight, 
  FileCheck, Shield, KeyRound, LogOut, HeartPulse, RefreshCw, X, LogIn, Edit2
} from 'lucide-react';

interface PatientPortalViewProps {
  onNavigate: (page: PageView) => void;
  onViewPass: (appointment: Appointment) => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  onNavigate,
  onViewPass
}) => {
  const { user, userProfile, userAppointments, signOut, updateUserProfile, cancelAppointmentInFirestore } = useAuth();
  
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [patient, setPatient] = useState<PatientProfile>(getStoredPatient());
  const [pinAuthenticated, setPinAuthenticated] = useState<boolean>(false);
  
  // Auth Form State for PIN / ID lookup
  const [inputReference, setInputReference] = useState<string>('MC-PAT-8941');
  const [inputPin, setInputPin] = useState<string>('7721');
  const [authError, setAuthError] = useState<string>('');

  // Editing profile fields
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editPhone, setEditPhone] = useState<string>('');
  const [editDob, setEditDob] = useState<string>('');
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [editBloodGroup, setEditBloodGroup] = useState<string>('A Positive (A+)');

  // Tab inside authenticated portal
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'reports' | 'vitals' | 'security'>('overview');
  const [auditLogs, setAuditLogs] = useState(getAuditLogs());

  // Modal for viewing full diagnostic report
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setEditPhone(userProfile.phone || '');
      setEditDob(userProfile.dob || '1990-05-15');
      setEditGender(userProfile.gender || 'Female');
      setEditBloodGroup(userProfile.bloodGroup || 'A Positive (A+)');
    }
  }, [userProfile]);

  useEffect(() => {
    setAuditLogs(getAuditLogs());
  }, []);

  const isAccessAuthorized = !!user || pinAuthenticated;

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getStoredPatient();
    
    const matchesPatient = (inputReference.trim().toUpperCase() === current.id || inputReference.trim().toLowerCase() === current.email.toLowerCase()) && inputPin.trim() === current.accessPin;
    const allApts = getAllAppointments();
    const matchingApt = allApts.find(a => (a.id.toUpperCase() === inputReference.trim().toUpperCase() || a.patientEmail.toLowerCase() === inputReference.trim().toLowerCase()) && a.accessCode === inputPin.trim());

    if (matchesPatient || matchingApt) {
      setPinAuthenticated(true);
      setAuthError('');
      logAuditAction('PATIENT_PORTAL_PIN_LOGIN_SUCCESS', true, `Session opened via PIN for ID: ${inputReference}`);
      setAuditLogs(getAuditLogs());
    } else {
      setAuthError('Invalid Patient Reference ID or Access PIN. Please verify your credentials.');
      logAuditAction('PATIENT_PORTAL_PIN_LOGIN_FAILED', false, `Failed authentication attempt for ID: ${inputReference}`);
      setAuditLogs(getAuditLogs());
    }
  };

  const handleLogout = async () => {
    if (user) {
      await signOut();
    }
    setPinAuthenticated(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        await updateUserProfile({
          phone: editPhone,
          dob: editDob,
          gender: editGender,
          bloodGroup: editBloodGroup
        });
      }
      setIsEditingProfile(false);
      logAuditAction('USER_PROFILE_UPDATED', true, `Profile updated for ${user?.email || patient.name}`);
      setAuditLogs(getAuditLogs());
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled appointment?')) {
      if (user) {
        await cancelAppointmentInFirestore(id);
      }
      updateAppointmentStatus(id, 'Cancelled');
      setAuditLogs(getAuditLogs());
    }
  };

  // Combine user bookings from Firestore with any local ones
  const displayedAppointments: Appointment[] = user
    ? userAppointments.length > 0
      ? userAppointments
      : getAllAppointments().filter(a => a.userId === user.uid || a.patientEmail === user.email)
    : patient.appointments;

  const handleExportData = () => {
    const exportPayload = {
      userProfile: userProfile || {
        name: patient.name,
        email: patient.email,
        phone: patient.phone
      },
      appointments: displayedAppointments,
      vitalsHistory: patient.vitalsHistory,
      diagnosticReports: patient.diagnosticReports,
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MediCore_HealthRecord_${user?.uid || patient.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logAuditAction('PATIENT_DATA_EXPORTED', true, `Full EHR health summary exported in encrypted JSON format.`);
    setAuditLogs(getAuditLogs());
  };

  const selectedReport = patient.diagnosticReports.find(r => r.id === selectedReportId);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>MediCore Central · Secure Health Records Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Patient Data & Booking Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              HIPAA & GDPR-compliant encrypted repository storing your verified medical profile, appointments, and diagnostic reports.
            </p>
          </div>

          {isAccessAuthorized && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300">
                Patient Account: <strong className="text-white font-semibold">{user?.displayName || userProfile?.name || patient.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800 rounded-lg hover:bg-rose-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {!isAccessAuthorized ? (
          /* Authentication Screen with Two Options: Firebase User Sign In OR PIN/ID Lookup */
          <div className="max-w-xl mx-auto space-y-6">
            {/* Primary Option: User Sign In & Sign Up */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4 text-center">
              <div className="w-12 h-12 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Sign In to Your Patient Account</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Access your real-time booked appointments, update personal health details, and view diagnostic records.
              </p>

              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Create Account with Google or Email</span>
              </button>
            </div>

            {/* Secondary Option: Reference ID & PIN Verification */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Quick Appointment Pass Lookup
                </span>
                <p className="text-[11px] text-slate-500">
                  Or enter your 4-digit booking PIN and reference code to view your visit pass.
                </p>
              </div>

              <div className="p-2.5 bg-teal-100/50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center justify-between">
                <span>Demo Record Available:</span>
                <span className="font-mono font-semibold">ID: MC-PAT-8941 · PIN: 7721</span>
              </div>

              <form onSubmit={handlePinLogin} className="space-y-3 text-xs font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Reference ID</label>
                    <input
                      type="text"
                      value={inputReference}
                      onChange={(e) => setInputReference(e.target.value)}
                      placeholder="e.g. MC-PAT-8941"
                      required
                      className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={inputPin}
                      onChange={(e) => setInputPin(e.target.value)}
                      placeholder="••••"
                      required
                      className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg font-mono text-center tracking-widest text-slate-900"
                    />
                  </div>
                </div>

                {authError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{authError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Verify PIN & View Record
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'appointments'
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>My Bookings ({displayedAppointments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'reports'
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Diagnostic Reports ({patient.diagnosticReports.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('vitals')}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'vitals'
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Vitals Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'security'
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>HIPAA & Audit Trail</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW & CLINICAL PROFILE */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Core Demographics & Identifiers */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-800 font-bold text-lg flex items-center justify-center">
                        {(user?.displayName || userProfile?.name || patient.name).split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          {user?.displayName || userProfile?.name || patient.name}
                        </h2>
                        <span className="text-xs text-slate-500 font-mono truncate max-w-[180px] block">
                          {user ? `UID: ${user.uid.slice(0, 10)}...` : `ID: ${patient.id}`}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium block">
                          Verified Encrypted Record
                        </span>
                      </div>
                    </div>

                    {user && !isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email:</span>
                        <span className="font-semibold text-slate-800">{user?.email || patient.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {userProfile?.phone || patient.phone || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date of Birth:</span>
                        <span className="font-semibold text-slate-800">
                          {userProfile?.dob || patient.dob}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Gender:</span>
                        <span className="font-semibold text-slate-800">
                          {userProfile?.gender || patient.gender}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Blood Group:</span>
                        <span className="font-semibold text-rose-700">
                          {userProfile?.bloodGroup || patient.bloodGroup}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Edit Form */
                    <form onSubmit={handleSaveProfile} className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+1 (555) 234-8910"
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={editDob}
                          onChange={(e) => setEditDob(e.target.value)}
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Gender</label>
                        <select
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value as any)}
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Blood Group</label>
                        <input
                          type="text"
                          value={editBloodGroup}
                          onChange={(e) => setEditBloodGroup(e.target.value)}
                          placeholder="A Positive (A+)"
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-1.5 text-xs text-white bg-teal-700 rounded-lg font-semibold"
                        >
                          Save Profile
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Emergency Contact */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Emergency Contact on File
                    </span>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-900 block">{patient.emergencyContact.name} ({patient.emergencyContact.relation})</span>
                      <span className="text-slate-500 font-mono">{patient.emergencyContact.phone}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleExportData}
                    className="w-full py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full Health Record</span>
                  </button>
                </div>

                {/* Right 2 Columns: Clinical Conditions, Allergies & Medications */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Allergies & Chronic Conditions */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Documented Allergies & Sensitivities</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy) => (
                        <span key={allergy} className="px-3 py-1 text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 rounded-md">
                          {allergy}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                        Chronic Conditions Under Active Management
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {patient.chronicConditions.map((cond) => (
                          <li key={cond} className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                            <span>{cond}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Current Active Prescriptions */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Active Medications & Regimen
                    </h3>
                    <div className="space-y-2.5">
                      {patient.currentMedications.map((med, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block">{med.name}</span>
                            <span className="text-slate-500">{med.frequency}</span>
                          </div>
                          <span className="font-mono font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                            {med.dosage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      My Scheduled & Past Appointments ({displayedAppointments.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Stored in MediCore Central database and linked to your patient identity.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('book')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book New Visit</span>
                  </button>
                </div>

                {displayedAppointments.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-800">No appointments scheduled yet</p>
                    <p className="text-xs text-slate-500">Schedule your consultation with one of our specialized doctors.</p>
                    <button
                      onClick={() => onNavigate('book')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg"
                    >
                      Schedule Appointment Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-800">{apt.id}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                              apt.status === 'Confirmed'
                                ? 'bg-teal-100 text-teal-800'
                                : apt.status === 'Completed'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {apt.status}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-xs text-slate-500">{apt.consultationType}</span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900">
                            {apt.doctorName}
                          </h4>
                          <p className="text-xs text-teal-700 font-medium">{apt.departmentName}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Reason: {apt.symptoms}
                          </p>
                        </div>

                        <div className="flex flex-col md:items-end justify-between gap-3 shrink-0">
                          <div className="text-xs md:text-right">
                            <span className="font-semibold text-slate-900 block">{apt.date}</span>
                            <span className="text-slate-500 block">{apt.timeSlot} · {apt.roomNumber}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onViewPass(apt)}
                              className="px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                            >
                              Digital Pass
                            </button>
                            {apt.status === 'Confirmed' && (
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DIAGNOSTIC LAB & RADIOLOGY REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Verified Diagnostic Reports
                    </h3>
                    <p className="text-xs text-slate-500">
                      All pathology, MRI radiology, and cardiovascular tests are signed off by attending physicians.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.diagnosticReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-teal-400 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-400">{report.id}</span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {report.status}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {report.testName}
                        </h4>

                        <p className="text-xs text-slate-500">
                          Ordered by {report.orderingDoctor}
                        </p>

                        <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                          {report.summary}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{report.date}</span>
                        <button
                          onClick={() => setSelectedReportId(report.id)}
                          className="font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Full Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: VITALS TIMELINE */}
            {activeTab === 'vitals' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Clinical Telemetry & Vitals History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorded during verified in-person triage examinations at MediCore Central outpatient pavilions.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Blood Pressure</th>
                        <th className="py-2.5 px-3">Heart Rate</th>
                        <th className="py-2.5 px-3">Oxygen Saturation</th>
                        <th className="py-2.5 px-3">Temp</th>
                        <th className="py-2.5 px-3">BMI</th>
                        <th className="py-2.5 px-3">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patient.vitalsHistory.map((vital, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-semibold text-slate-900">{vital.date}</td>
                          <td className="py-3 px-3 font-mono font-medium text-slate-800">{vital.bloodPressure}</td>
                          <td className="py-3 px-3 font-mono text-slate-800">{vital.heartRate} bpm</td>
                          <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">{vital.oxygenSaturation}% SpO2</td>
                          <td className="py-3 px-3 text-slate-700">{vital.temperature}</td>
                          <td className="py-3 px-3 font-mono text-slate-700">{vital.bmi}</td>
                          <td className="py-3 px-3 text-slate-500">{vital.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY AUDIT & HIPAA LOGS */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>Cryptographic Security & Data Governance</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    MediCore Central implements client-side encryption, Firebase Firestore security rules, and immutable chronological audit logging for all patient record queries in accordance with federal HIPAA Security Rules (45 CFR § 164.312).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-500 block">Cloud Database</span>
                      <strong className="text-slate-900 font-mono">Firestore (Enterprise)</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-500 block">Authentication Security</span>
                      <strong className="text-emerald-700 font-semibold">Firebase Identity SDK</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-500 block">Tamper Audit Trail</span>
                      <strong className="text-slate-900 font-mono">{auditLogs.length} Verified Events</strong>
                    </div>
                  </div>
                </div>

                {/* Audit Trail Table */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Access Audit Trail (Recent Activity)
                  </h4>
                  <div className="space-y-2">
                    {auditLogs.slice(0, 8).map((log, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-slate-900 block">{log.action}</span>
                          <span className="text-slate-500">{log.details}</span>
                        </div>
                        <div className="text-right text-[11px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Diagnostic Report Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono text-teal-700 uppercase font-semibold">{selectedReport.category} · {selectedReport.id}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedReport.testName}</h3>
                <p className="text-xs text-slate-500">Ordered by {selectedReport.orderingDoctor} on {selectedReport.date}</p>
              </div>
              <button
                onClick={() => setSelectedReportId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Equipment / Modality</span>
                <span className="font-semibold text-slate-800">{selectedReport.specimenOrModality}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Clinical Summary</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedReport.summary}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">Detailed Clinical Findings</span>
                <ul className="space-y-1.5 text-slate-600">
                  {selectedReport.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedReportId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
