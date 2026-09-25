import React, { useState } from 'react';
import { Department, Doctor, PageView } from '../types/hospital';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { 
  HeartPulse, Brain, Bone, ShieldAlert, Baby, Activity, Stethoscope, Eye, 
  MapPin, Phone, CheckCircle2, ChevronRight, Calendar, Star, Users
} from 'lucide-react';

interface DepartmentsViewProps {
  onNavigate: (page: PageView) => void;
  selectedDeptId: string | null;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookWithDoctor: (doctor: Doctor) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  onNavigate,
  selectedDeptId,
  onSelectDoctor,
  onBookWithDoctor,
}) => {
  const [activeDeptId, setActiveDeptId] = useState<string>(selectedDeptId || 'all');

  const filteredDepts = activeDeptId === 'all'
    ? DEPARTMENTS
    : DEPARTMENTS.filter(d => d.id === activeDeptId);

  const renderIcon = (id: string) => {
    switch (id) {
      case 'cardiology': return <HeartPulse className="w-5 h-5" />;
      case 'neurology': return <Brain className="w-5 h-5" />;
      case 'orthopedics': return <Bone className="w-5 h-5" />;
      case 'oncology': return <ShieldAlert className="w-5 h-5" />;
      case 'pediatrics': return <Baby className="w-5 h-5" />;
      case 'emergency': return <Activity className="w-5 h-5" />;
      case 'obstetrics': return <Stethoscope className="w-5 h-5" />;
      case 'ophthalmology': return <Eye className="w-5 h-5" />;
      default: return <HeartPulse className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
            Clinical Institutes & Centers of Excellence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Specialized Medical Departments
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Every department at MediCore Central operates as an integrated center of excellence, equipped with cutting-edge diagnostic suites, dedicated intensive care units, and experienced specialist physicians.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Department Filter Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 text-xs font-medium border-b border-slate-200">
          <button
            onClick={() => setActiveDeptId('all')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeDeptId === 'all'
                ? 'bg-teal-700 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Departments ({DEPARTMENTS.length})
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveDeptId(dept.id)}
              className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeDeptId === dept.id
                  ? 'bg-teal-700 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {dept.shortName}
            </button>
          ))}
        </div>

        {/* Departments List with Multiple Doctors in Each Department */}
        <div className="space-y-12">
          {filteredDepts.map((dept) => {
            const deptDoctors = DOCTORS.filter(d => d.departmentId === dept.id);

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                {/* Department Header Banner */}
                <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-600/80 text-white flex items-center justify-center">
                        {renderIcon(dept.id)}
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                          {dept.name}
                        </h2>
                        <p className="text-xs text-teal-300 font-medium">
                          {dept.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Department Clinical Metrics */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase">Annual Procedures</span>
                      <span className="text-base font-bold text-white font-mono">{dept.casesPerYear}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase">Success Rate</span>
                      <span className="text-base font-bold text-teal-400 font-mono">{dept.successRate}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase">Critical Care</span>
                      <span className="text-xs font-semibold text-white">{dept.icuBeds}</span>
                    </div>
                  </div>
                </div>

                {/* Department Details Body */}
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Overview description and Subspecialties Bento */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Clinical Overview */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Clinical Overview & Scope of Care
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {dept.description}
                      </p>

                      <div className="pt-2 space-y-2">
                        <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                          Subspecialty Programs
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {dept.subspecialties.map((sub) => (
                            <div key={sub} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span>{sub}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Department Location & Key Facilities Box */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">
                          Pavilion Location
                        </span>
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                            <span className="font-semibold text-slate-900">{dept.floor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                            <span>Direct Line: {dept.contactExt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">
                          Advanced Equipment
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {dept.keyFacilities.map((fac) => (
                            <li key={fac} className="flex items-start gap-1.5">
                              <span className="text-teal-700 font-bold">·</span>
                              <span>{fac}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Doctors for this Department */}
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-teal-700" />
                          <span>Specialist Physicians in {dept.shortName} ({deptDoctors.length})</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Each physician maintains regular outpatient clinic hours and inpatient surgical operating schedules.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {deptDoctors.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-xs transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start gap-3">
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
                                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mb-0.5">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{doc.rating}</span>
                                  <span className="text-slate-400 font-normal">({doc.reviewsCount})</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {doc.name}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {doc.title}
                                </p>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                              {doc.bio}
                            </p>

                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                              <span>Fee: <strong className="text-slate-900">${doc.consultationFee}</strong></span>
                              <span>Room: <strong className="text-slate-900">{doc.room.split(',')[1] || doc.room}</strong></span>
                            </div>
                          </div>

                          <div className="mt-4 pt-2 flex items-center gap-2">
                            <button
                              onClick={() => onSelectDoctor(doc)}
                              className="flex-1 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => onBookWithDoctor(doc)}
                              className="flex-1 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Book Slot</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
