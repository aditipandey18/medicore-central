import React from 'react';
import { Doctor } from '../types/hospital';
import { X, Star, Calendar, Clock, MapPin, Award, CheckCircle2, Shield, Languages, DollarSign } from 'lucide-react';

interface DoctorModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBook: (doctor: Doctor) => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({ doctor, onClose, onBook }) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Close */}
        <div className="relative p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback container
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-800 font-bold text-lg">
                {doctor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-teal-700 font-medium mb-1">
                <span>{doctor.departmentName}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{doctor.rating}</span>
                  <span className="text-slate-400 font-normal">({doctor.reviewsCount} verified reviews)</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {doctor.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                {doctor.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm text-slate-600">
          {/* Key Quick Badges / Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Experience</span>
              <span className="text-sm font-semibold text-slate-900">{doctor.experienceYears}+ Years</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Consultation</span>
              <span className="text-sm font-semibold text-slate-900">${doctor.consultationFee}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Location</span>
              <span className="text-xs font-semibold text-slate-900 truncate block">{doctor.room.split(',')[0]}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Status</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Accepting New
              </span>
            </div>
          </div>

          {/* Clinical Bio */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-2">
              Clinical Background & Philosophy
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {doctor.bio}
            </p>
          </div>

          {/* Academic Qualifications & Fellowships */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-2">
              Qualifications & Credentials
            </h3>
            <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-700 leading-normal font-medium">
                {doctor.qualification}
              </p>
            </div>
          </div>

          {/* Core Procedural Specialties */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-2">
              Procedural & Clinical Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {doctor.specialties.map((spec) => (
                <span 
                  key={spec}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md border border-slate-200/60"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Honors & Awards */}
          {doctor.awards && doctor.awards.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-2">
                Honors & Accolades
              </h3>
              <ul className="space-y-1.5">
                {doctor.awards.map((award) => (
                  <li key={award} className="flex items-center gap-2 text-xs text-slate-700">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{award}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Available Days and Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Clinic Schedule
              </span>
              <p className="text-xs text-slate-600">
                {doctor.availableDays.join(', ')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Slots: {doctor.availableSlots.slice(0, 3).join(', ')}...
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <Languages className="w-3.5 h-3.5 text-teal-600" />
                Languages Spoken
              </span>
              <p className="text-xs text-slate-600">
                {doctor.languages.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span>Clinic Fee: </span>
            <span className="text-sm font-bold text-slate-900">${doctor.consultationFee}</span>
            <span className="text-slate-400"> / session</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBook(doctor);
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
