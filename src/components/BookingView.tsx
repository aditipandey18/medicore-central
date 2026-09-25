import React, { useState, useEffect } from 'react';
import { Department, Doctor, Appointment, PageView } from '../types/hospital';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { recordNewAppointment, generateReferenceId, generatePinCode } from '../utils/security';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { 
  Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, 
  ArrowRight, ArrowLeft, Shield, AlertCircle, Video, Building, Star, Check,
  Lock, LogIn, UserPlus
} from 'lucide-react';

interface BookingViewProps {
  initialDeptId?: string | null;
  initialDoctorId?: string | null;
  onAppointmentBooked: (appointment: Appointment) => void;
  onNavigate: (page: PageView) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({
  initialDeptId,
  initialDoctorId,
  onAppointmentBooked,
  onNavigate,
}) => {
  const { user, userProfile, saveAppointmentToFirestore, updateUserProfile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Wizard steps: 1: Doctor/Dept, 2: Slot/Date/Mode, 3: Patient Info, 4: Review
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [departmentId, setDepartmentId] = useState<string>(initialDeptId || 'cardiology');
  const [doctorId, setDoctorId] = useState<string>(initialDoctorId || '');
  const [consultationType, setConsultationType] = useState<'In-Person Clinic' | 'Telehealth Video'>('In-Person Clinic');
  
  // Date and Slot
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(tomorrow);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');

  // Patient Info (auto-filled from authenticated user profile)
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientDob, setPatientDob] = useState('1990-05-15');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'Follow-up'>('Routine');
  const [symptoms, setSymptoms] = useState('');
  const [hipaaAgreed, setHipaaAgreed] = useState(true);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate from authenticated user
  useEffect(() => {
    if (user) {
      if (user.displayName && !patientName) setPatientName(user.displayName);
      if (user.email && !patientEmail) setPatientEmail(user.email);
      if (userProfile?.phone && !patientPhone) setPatientPhone(userProfile.phone);
      if (userProfile?.name && !patientName) setPatientName(userProfile.name);
      if (userProfile?.dob) setPatientDob(userProfile.dob);
      if (userProfile?.gender) setPatientGender(userProfile.gender);
    }
  }, [user, userProfile]);

  // Sync if props change
  useEffect(() => {
    if (initialDeptId) setDepartmentId(initialDeptId);
    if (initialDoctorId) {
      setDoctorId(initialDoctorId);
      const doc = DOCTORS.find(d => d.id === initialDoctorId);
      if (doc) setDepartmentId(doc.departmentId);
    }
  }, [initialDeptId, initialDoctorId]);

  // Available doctors in current department
  const availableDoctors = DOCTORS.filter(d => d.departmentId === departmentId);
  const selectedDoctor = DOCTORS.find(d => d.id === doctorId) || availableDoctors[0];
  const selectedDept = DEPARTMENTS.find(d => d.id === departmentId);

  // Auto select first doctor if unselected
  useEffect(() => {
    if (!doctorId || (selectedDoctor && selectedDoctor.departmentId !== departmentId)) {
      if (availableDoctors.length > 0) {
        setDoctorId(availableDoctors[0].id);
      }
    }
  }, [departmentId, availableDoctors, doctorId, selectedDoctor]);

  // Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!selectedDate) errs.date = 'Please select an appointment date.';
    if (!selectedSlot) errs.slot = 'Please select a time slot.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!patientName.trim()) errs.name = 'Full patient name is required.';
    if (!patientEmail.trim() || !patientEmail.includes('@')) errs.email = 'Valid email address is required.';
    if (!patientPhone.trim() || patientPhone.length < 8) errs.phone = 'Valid phone number is required.';
    if (!symptoms.trim()) errs.symptoms = 'Please briefly describe symptoms or reason for visit.';
    if (!hipaaAgreed) errs.hipaa = 'You must accept the HIPAA clinical consent to schedule.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    // If not signed in, prompt authentication before proceeding!
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    }
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedDoctor || !selectedDept) return;

    setIsSubmitting(true);
    try {
      const newApt: Appointment = {
        id: generateReferenceId(),
        userId: user.uid,
        patientName,
        patientEmail,
        patientPhone,
        patientDob,
        patientGender,
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: selectedDate,
        timeSlot: selectedSlot,
        consultationType,
        symptoms,
        urgency,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        accessCode: generatePinCode(),
        roomNumber: selectedDoctor.room,
        notes: `Standard consultation with Dr. ${selectedDoctor.name}. Please arrive 15 minutes before your time slot.`
      };

      // 1. Store in Firestore database
      await saveAppointmentToFirestore(newApt);

      // 2. Also record in local store for offline fallback
      recordNewAppointment(newApt);

      // 3. Update user profile phone/details if missing
      if (!userProfile?.phone && patientPhone) {
        await updateUserProfile({ phone: patientPhone, dob: patientDob, gender: patientGender });
      }

      // 4. Trigger pass modal
      onAppointmentBooked(newApt);
    } catch (err) {
      console.error('Failed to book appointment:', err);
      alert('There was an issue saving your booking to the database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM',
    '11:30 AM', '01:30 PM', '02:15 PM', '03:00 PM',
    '03:45 PM', '04:30 PM'
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
            Patient Admissions & Scheduling
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Schedule an Appointment
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Sign in to reserve your consultation slot. All appointment records and health data are stored securely in your encrypted patient account.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* If user is NOT signed in: prominent patient account notice */}
        {!user && (
          <div className="mb-6 p-5 bg-teal-50/90 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sign In Required to Book & Save Appointments
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sign in or create a patient account before scheduling to link your medical records, receive appointment reminders, and view clinical test reports.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Sign Up</span>
            </button>
          </div>
        )}

        {/* If user IS signed in: show active identity badge */}
        {user && (
          <div className="mb-6 p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                {(user.displayName || user.email || 'P')[0].toUpperCase()}
              </div>
              <div>
                <span className="text-slate-500">Booking as authenticated patient: </span>
                <strong className="text-slate-900 font-semibold">{user.displayName || user.email}</strong>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Account
            </span>
          </div>
        )}

        {/* Main Booking Wizard Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Step Progress Tracker */}
          <div className="grid grid-cols-4 border-b border-slate-200 text-xs font-semibold bg-slate-50">
            <div className={`p-3.5 text-center border-r border-slate-200 flex items-center justify-center gap-1.5 ${
              currentStep === 1 ? 'bg-white text-teal-800 border-b-2 border-b-teal-600' : currentStep > 1 ? 'text-teal-700' : 'text-slate-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                currentStep > 1 ? 'bg-teal-600 text-white' : currentStep === 1 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span className="hidden sm:inline">Physician</span>
            </div>

            <div className={`p-3.5 text-center border-r border-slate-200 flex items-center justify-center gap-1.5 ${
              currentStep === 2 ? 'bg-white text-teal-800 border-b-2 border-b-teal-600' : currentStep > 2 ? 'text-teal-700' : 'text-slate-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                currentStep > 2 ? 'bg-teal-600 text-white' : currentStep === 2 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span className="hidden sm:inline">Date & Time</span>
            </div>

            <div className={`p-3.5 text-center border-r border-slate-200 flex items-center justify-center gap-1.5 ${
              currentStep === 3 ? 'bg-white text-teal-800 border-b-2 border-b-teal-600' : currentStep > 3 ? 'text-teal-700' : 'text-slate-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                currentStep > 3 ? 'bg-teal-600 text-white' : currentStep === 3 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 3 ? <Check className="w-3 h-3" /> : '3'}
              </span>
              <span className="hidden sm:inline">Patient Info</span>
            </div>

            <div className={`p-3.5 text-center flex items-center justify-center gap-1.5 ${
              currentStep === 4 ? 'bg-white text-teal-800 border-b-2 border-b-teal-600' : 'text-slate-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                currentStep === 4 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
              }`}>
                4
              </span>
              <span className="hidden sm:inline">Confirm</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* STEP 1: Department & Doctor */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 1: Select Department & Physician</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the medical department and your preferred specialist. Each department has multiple experienced doctors available.
                  </p>
                </div>

                {/* Department Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Medical Department
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setDepartmentId(dept.id)}
                        className={`p-3 text-left rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          departmentId === dept.id
                            ? 'bg-teal-50 border-teal-600 text-teal-900 ring-1 ring-teal-600 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block truncate font-semibold">{dept.shortName}</span>
                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">{dept.floor}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Selection within this department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Available Specialists in {selectedDept?.name} ({availableDoctors.length})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setDoctorId(doc.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          (doctorId === doc.id || (!doctorId && doc === availableDoctors[0]))
                            ? 'bg-teal-50/70 border-teal-600 ring-1 ring-teal-600'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={doc.avatar}
                            alt={doc.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {doc.name}
                            </h3>
                            <span className="text-xs font-semibold text-teal-800 font-mono">
                              ${doc.consultationFee}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{doc.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {doc.rating}
                            </span>
                            <span>·</span>
                            <span>{doc.experienceYears} yrs exp</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Date, Slot & Consultation Mode */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 2: Choose Date, Time & Mode</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Appointments with {selectedDoctor?.name} ({selectedDept?.shortName})
                  </p>
                </div>

                {/* Consultation Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setConsultationType('In-Person Clinic')}
                      className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        consultationType === 'In-Person Clinic'
                          ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Building className={`w-5 h-5 shrink-0 ${consultationType === 'In-Person Clinic' ? 'text-teal-700' : 'text-slate-400'}`} />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">In-Person Clinic Visit</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Suite {selectedDoctor?.room || 'Main Pavilion'}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType('Telehealth Video')}
                      className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        consultationType === 'Telehealth Video'
                          ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Video className={`w-5 h-5 shrink-0 ${consultationType === 'Telehealth Video' ? 'text-teal-700' : 'text-slate-400'}`} />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Encrypted Telehealth</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          HD Video link via Patient Portal
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Appointment Date
                  </label>
                  <input
                    type="date"
                    min={tomorrow}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-72 p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 font-medium"
                  />
                  {errors.date && <p className="text-xs text-rose-600 mt-1">{errors.date}</p>}
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Available Time Slots for {selectedDate}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? 'bg-teal-700 text-white font-semibold border-teal-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.slot && <p className="text-xs text-rose-600 mt-1">{errors.slot}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: Patient Information & Clinical Triage */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 3: Patient Information & Clinical Reason</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-filled with your authenticated account details. Stored securely in compliance with HIPAA privacy standards.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Eleanor Vance Sterling"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800"
                    />
                    {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address (for Digital Pass & Notifications) *
                    </label>
                    <input
                      type="email"
                      placeholder="eleanor@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800"
                    />
                    {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Phone (for SMS Reminders) *
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 234-8910"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 font-mono"
                    />
                    {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={patientDob}
                      onChange={(e) => setPatientDob(e.target.value)}
                      className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other / Prefer not to say</option>
                    </select>
                  </div>

                  {/* Urgency */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Appointment Priority
                    </label>
                    <div className="flex gap-4">
                      {(['Routine', 'Follow-up', 'Urgent'] as const).map((urg) => (
                        <label key={urg} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="urgency"
                            checked={urgency === urg}
                            onChange={() => setUrgency(urg)}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <span>{urg}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Symptoms & Medical Reason */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Chief Complaint or Symptoms Description *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Please mention primary symptoms, onset date, or specific referral reasons..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800"
                    />
                    {errors.symptoms && <p className="text-xs text-rose-600 mt-1">{errors.symptoms}</p>}
                  </div>
                </div>

                {/* HIPAA Consent */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hipaaAgreed}
                      onChange={(e) => setHipaaAgreed(e.target.checked)}
                      className="mt-0.5 text-teal-600 focus:ring-teal-500 rounded"
                    />
                    <span>
                      I authorize MediCore Central to store this health registration securely and agree to the Notice of Privacy Practices (HIPAA / GDPR).
                    </span>
                  </label>
                  {errors.hipaa && <p className="text-xs text-rose-600 mt-1">{errors.hipaa}</p>}
                </div>
              </div>
            )}

            {/* STEP 4: Review & Confirm */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 4: Review & Confirm Appointment</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please inspect your appointment details prior to final registration and database storage.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase">Department & Doctor</span>
                      <span className="text-sm font-bold text-slate-900 block">{selectedDoctor?.name}</span>
                      <span className="text-xs text-teal-700">{selectedDept?.name}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase">Scheduled Time</span>
                      <span className="text-sm font-bold text-slate-900 block">{selectedDate}</span>
                      <span className="text-xs text-slate-600 font-medium">{selectedSlot} ({consultationType})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase">Patient Account</span>
                      <span className="text-xs font-semibold text-slate-900 block">{patientName}</span>
                      <span className="text-xs text-slate-500">{patientEmail} · {patientPhone}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase">Consultation Location</span>
                      <span className="text-xs font-semibold text-slate-900 block">{selectedDoctor?.room}</span>
                      <span className="text-xs text-slate-500">Pavilion Main Entrance</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase">Chief Complaint</span>
                    <p className="text-xs text-slate-700 mt-0.5">{symptoms}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Consultation Fee:</span>
                    <span className="text-base font-bold text-slate-900 font-mono">${selectedDoctor?.consultationFee}</span>
                  </div>
                </div>

                <div className="p-4 bg-teal-50 border border-teal-200/80 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
                  <p>
                    Your booking will be stored in your secure MediCore Central patient account database. A digital check-in pass will be issued immediately with your booking reference.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering with Database...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Register Appointment</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal gate */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        reason="Please sign in or register to schedule and store your appointment bookings."
        onSuccess={() => {
          // Stay on booking page
        }}
      />
    </div>
  );
};
