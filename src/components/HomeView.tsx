import React from 'react';
import { PageView, Doctor, Department } from '../types/hospital';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { 
  Calendar, Shield, HeartPulse, Brain, Bone, Activity, ArrowRight, 
  Clock, Award, CheckCircle2, ChevronRight, Star, Phone, Stethoscope, Eye, UserCheck
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: PageView) => void;
  onSelectDepartment: (deptId: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookWithDoctor: (doctor: Doctor) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectDepartment,
  onSelectDoctor,
  onBookWithDoctor,
}) => {
  // Key featured departments
  const featuredDepts = DEPARTMENTS.slice(0, 4);
  const featuredDoctors = DOCTORS.slice(0, 4);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        {/* Background photo with measured contrast scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hospital_hero_facade_1790329081029.jpg"
            alt="MediCore Central Medical Pavilion"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-[0.45] saturate-110"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Academic Tertiary Healthcare · Metro Health District</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-balance">
              Precision Medicine. <br className="hidden sm:inline" />
              Compassionate Care.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              MediCore Central brings together board-certified surgical leaders, advanced hybrid robotic operating suites, and encrypted patient data systems to deliver the highest standard of personalized medical care.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('book')}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-500 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>

              <button
                onClick={() => onNavigate('departments')}
                className="px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Departments</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('portal')}
                className="px-5 py-3.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-teal-400" />
                <span>Patient Portal</span>
              </button>
            </div>

            {/* Clinical Trust Credentials */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>JCI Gold Seal of Approval</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Level 1 Adult & Pediatric Trauma</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>24/7 Rapid Cath Lab Response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Emergency Card at Base */}
        <div className="relative z-10 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-rose-300 block">Emergency Trauma Center</span>
                <a href="tel:8005550199" className="text-sm font-bold text-white hover:text-rose-200 transition-colors">
                  +1 (800) 555-0199
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-800 text-teal-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Outpatient Clinic Hours</span>
                <span className="text-xs text-slate-400">Mon - Sat: 08:00 AM – 07:00 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Encrypted Patient Portal</span>
                <button 
                  onClick={() => onNavigate('portal')}
                  className="text-xs text-teal-300 hover:underline cursor-pointer"
                >
                  Manage EHR & Test Results →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quantitative Clinical Rigor & Impact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              99.4%
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">Procedural Success</p>
            <p className="text-xs text-slate-500">Across 14,000+ complex surgical and interventional procedures.</p>
          </div>

          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-700 tracking-tight font-mono tabular-nums">
              24 min
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">Door-to-Needle Stroke</p>
            <p className="text-xs text-slate-500">Rapid clot-retrieval protocol beating national benchmarks by 36 minutes.</p>
          </div>

          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              18+
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">Clinical Specialties</p>
            <p className="text-xs text-slate-500">Dedicated centers of excellence staffed by board-certified faculty.</p>
          </div>

          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-700 tracking-tight font-mono tabular-nums">
              180+
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">ICU & Critical Beds</p>
            <p className="text-xs text-slate-500">Continuous 1:1 nurse-to-patient monitoring in intensive care wings.</p>
          </div>
        </div>
      </section>

      {/* Clinical Departments Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <span>01. Centers of Excellence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Specialized Clinical Departments
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Each department is led by distinguished surgical directors with specialized sub-clinics, dedicated diagnostic tools, and multi-disciplinary teams.
            </p>
          </div>

          <button
            onClick={() => onNavigate('departments')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
          >
            <span>View All 8 Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDepts.map((dept) => {
            const doctorsInDept = DOCTORS.filter(d => d.departmentId === dept.id);
            return (
              <div
                key={dept.id}
                className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-teal-400 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    {dept.id === 'cardiology' && <HeartPulse className="w-5 h-5" />}
                    {dept.id === 'neurology' && <Brain className="w-5 h-5" />}
                    {dept.id === 'orthopedics' && <Bone className="w-5 h-5" />}
                    {dept.id === 'oncology' && <Activity className="w-5 h-5" />}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Annual Cases:</span>
                      <span className="font-semibold text-slate-800 font-mono">{dept.casesPerYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Faculty Specialists:</span>
                      <span className="font-semibold text-slate-800">{doctorsInDept.length} Doctors</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectDepartment(dept.id)}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>View Faculty</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectDepartment(dept.id);
                      onNavigate('book');
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-teal-50 hover:text-teal-800 transition-colors cursor-pointer"
                  >
                    Book Dept
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* State-of-the-Art Facilities & Surgical Theatre Showcase */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              02. Surgical Infrastructure
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Advanced Clinical Technology
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Equipped with intraoperative imaging, robotic guidance, and sterile surgical suites designed for zero cross-contamination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hybrid Surgical Robotics */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col">
              <div className="h-48 overflow-hidden bg-slate-200">
                <img
                  src="/src/assets/images/surgical_theatre_robotics_1790329095390.jpg"
                  alt="Hybrid Robotic Surgical Operating Suite"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 block mb-1">
                    Operating Suites
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Hybrid Robotic Surgical Operating Suites
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Featuring Da Vinci Xi robotic consoles, integrated 3D fluoro-guidance, and real-time hemodynamic monitoring for sub-millimeter surgical precision.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>14 Specialized Sterile Operating Theaters</span>
                </div>
              </div>
            </div>

            {/* 3T High Field MRI */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col">
              <div className="h-48 overflow-hidden bg-slate-200">
                <img
                  src="/src/assets/images/diagnostic_mri_suite_1790329121602.jpg"
                  alt="Diagnostic Imaging Suite with 3T MRI"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 block mb-1">
                    Diagnostic Radiology
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    3.0 Tesla High-Field MRI & Spectral CT
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Ultra-quiet wide-bore magnetic resonance scanning provides high spatial resolution for micro-vascular brain mapping, cardiac strain, and tumor margins.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>Direct Electronic Report Sync to Patient Portal</span>
                </div>
              </div>
            </div>

            {/* Outpatient Consultation & Triage */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col">
              <div className="h-48 overflow-hidden bg-slate-200">
                <img
                  src="/src/assets/images/doctor_consultation_room_1790329109197.jpg"
                  alt="Physician Consultation Suite"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 block mb-1">
                    Outpatient Ambulatory
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Dedicated Private Consultation Suites
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Acoustically insulated consultation rooms offering private patient examinations, real-time vital telemetry recording, and comprehensive treatment planning.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>64 Outpatient Specialty Exam Rooms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              03. Distinguished Specialists
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Meet Our Senior Faculty & Surgeons
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Board-certified practitioners with international fellowships, proven clinical publication records, and a commitment to personalized bedside care.
            </p>
          </div>

          <button
            onClick={() => onNavigate('doctors')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
          >
            <span>View All Doctors Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-52 bg-slate-100 relative overflow-hidden">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-xs font-semibold text-slate-900 flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
                    {doc.departmentName}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {doc.title}
                  </p>

                  <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
                    <span>{doc.experienceYears}+ Yrs Experience</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800">${doc.consultationFee}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => onSelectDoctor(doc)}
                  className="w-full py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  View Profile & Research
                </button>
                <button
                  onClick={() => onBookWithDoctor(doc)}
                  className="w-full py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Patient Testimonials & Quality Accreditations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider block mb-1">
              Verified Patient Experiences
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Compassionate Healing, Documented Outcomes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "When my father required urgent aortic valve replacement, Dr. Elena Vance and the cardiac surgical team explained every step with incredible kindness. He was discharged in 48 hours."
              </p>
              <div className="pt-2 border-t border-slate-700 text-xs">
                <p className="font-semibold text-white">Marcus Sterling</p>
                <p className="text-slate-400">Son of TAVR Patient · Cardiology Center</p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "The patient portal made checking my post-operative MRI scans and messaging my care team completely effortless. Truly modern healthcare where privacy is respected."
              </p>
              <div className="pt-2 border-t border-slate-700 text-xs">
                <p className="font-semibold text-white">Claire Dupont</p>
                <p className="text-slate-400">Spine Rehabilitation Patient · Neurology</p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "The pediatric team treated our premature baby in the Level IV NICU with unmatched sensitivity. Today she is a thriving, healthy 2-year-old."
              </p>
              <div className="pt-2 border-t border-slate-700 text-xs">
                <p className="font-semibold text-white">Sarah & Michael Jensen</p>
                <p className="text-slate-400">Parents · Neonatal Intensive Care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Banner: Schedule Today */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-teal-800 text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Schedule Your Consultation at MediCore Central
            </h2>
            <p className="text-sm text-teal-100 max-w-xl">
              Select your department, choose your preferred specialist, and reserve an in-person clinic or telehealth consultation with immediate digital pass confirmation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('book')}
              className="px-6 py-3.5 text-sm font-semibold text-teal-900 bg-white hover:bg-teal-50 rounded-lg transition-colors cursor-pointer shadow-md"
            >
              Book Appointment Now
            </button>
            <button
              onClick={() => onNavigate('doctors')}
              className="px-5 py-3.5 text-sm font-semibold text-white bg-teal-900 hover:bg-teal-950 rounded-lg transition-colors cursor-pointer"
            >
              Search Doctors
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
