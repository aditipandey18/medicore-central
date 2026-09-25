import React, { useState } from 'react';
import { Doctor, PageView } from '../types/hospital';
import { DOCTORS, DEPARTMENTS } from '../data/hospitalData';
import { Search, Filter, Star, Calendar, MapPin, Award, CheckCircle2, ChevronRight, User } from 'lucide-react';

interface DoctorsViewProps {
  onNavigate: (page: PageView) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookWithDoctor: (doctor: Doctor) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  onNavigate,
  onSelectDoctor,
  onBookWithDoctor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesDept = selectedDeptFilter === 'all' || doc.departmentId === selectedDeptFilter;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
            Distinguished Faculty & Medical Directorate
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Find a Physician or Surgeon
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Our medical staff includes internationally fellowship-trained department chairs, robotic surgical masters, and dedicated clinicians across all eight specialty pavilions.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by physician name, specialty (e.g. TAVR, Robotic Knee, Stroke), or credential..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Department Dropdown Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 font-medium cursor-pointer"
              >
                <option value="all">All Departments ({DOCTORS.length})</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Tag Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 shrink-0">Popular:</span>
            {['cardiology', 'neurology', 'orthopedics', 'oncology', 'pediatrics'].map((deptId) => {
              const dept = DEPARTMENTS.find(d => d.id === deptId);
              if (!dept) return null;
              return (
                <button
                  key={deptId}
                  onClick={() => setSelectedDeptFilter(deptId)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedDeptFilter === deptId
                      ? 'bg-teal-700 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept.shortName}
                </button>
              );
            })}
            {selectedDeptFilter !== 'all' && (
              <button
                onClick={() => setSelectedDeptFilter('all')}
                className="text-xs text-teal-700 hover:underline ml-2 whitespace-nowrap cursor-pointer font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Specialist' : 'Specialists'}
          </p>
          <span className="text-xs text-slate-400">
            All doctors are credentialed and accepting new patients
          </span>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <User className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Specialists Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any doctors matching "{searchTerm}". Try clearing your search term or filtering by a different department.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDeptFilter('all');
              }}
              className="mt-2 px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="h-56 bg-slate-100 relative overflow-hidden">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded text-xs font-medium">
                      {doc.departmentName}
                    </div>

                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-teal-700 font-medium mt-0.5">
                        {doc.title}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.bio}
                    </p>

                    {/* Procedural specialties tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doc.specialties.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-slate-100 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Metadata strip */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <span>Exp: </span>
                        <strong className="text-slate-800">{doc.experienceYears}+ yrs</strong>
                      </div>
                      <div className="text-slate-300">·</div>
                      <div>
                        <span>Fee: </span>
                        <strong className="text-slate-900 font-semibold">${doc.consultationFee}</strong>
                      </div>
                      <div className="text-slate-300">·</div>
                      <div className="text-emerald-700 font-medium flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Accepting</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectDoctor(doc)}
                    className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onBookWithDoctor(doc)}
                    className="w-full py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Visit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
