/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageView, Doctor, Appointment } from './types/hospital';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { DepartmentsView } from './components/DepartmentsView';
import { DoctorsView } from './components/DoctorsView';
import { BookingView } from './components/BookingView';
import { PatientPortalView } from './components/PatientPortalView';
import { AdminPortalView } from './components/AdminPortalView';
import { DoctorModal } from './components/DoctorModal';
import { AppointmentPassModal } from './components/AppointmentPassModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);
  const [activeAppointmentPass, setActiveAppointmentPass] = useState<Appointment | null>(null);

  // Cross-page navigation context
  const [preselectedDeptId, setPreselectedDeptId] = useState<string | null>(null);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | null>(null);

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDepartment = (deptId: string) => {
    setPreselectedDeptId(deptId);
    setCurrentPage('departments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctorModal(doctor);
  };

  const handleBookWithDoctor = (doctor: Doctor) => {
    setPreselectedDeptId(doctor.departmentId);
    setPreselectedDoctorId(doctor.id);
    setCurrentPage('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAppointmentBooked = (appointment: Appointment) => {
    setActiveAppointmentPass(appointment);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
        {/* Universal 3-Zone Top Navigation */}
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

        {/* Main View Router */}
        <main className="flex-1">
          {currentPage === 'home' && (
            <HomeView
              onNavigate={handleNavigate}
              onSelectDepartment={handleSelectDepartment}
              onSelectDoctor={handleSelectDoctor}
              onBookWithDoctor={handleBookWithDoctor}
            />
          )}

          {currentPage === 'about' && (
            <AboutView onNavigate={handleNavigate} />
          )}

          {currentPage === 'departments' && (
            <DepartmentsView
              onNavigate={handleNavigate}
              selectedDeptId={preselectedDeptId}
              onSelectDoctor={handleSelectDoctor}
              onBookWithDoctor={handleBookWithDoctor}
            />
          )}

          {currentPage === 'doctors' && (
            <DoctorsView
              onNavigate={handleNavigate}
              onSelectDoctor={handleSelectDoctor}
              onBookWithDoctor={handleBookWithDoctor}
            />
          )}

          {currentPage === 'book' && (
            <BookingView
              initialDeptId={preselectedDeptId}
              initialDoctorId={preselectedDoctorId}
              onAppointmentBooked={handleAppointmentBooked}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'portal' && (
            <PatientPortalView
              onNavigate={handleNavigate}
              onViewPass={(apt) => setActiveAppointmentPass(apt)}
            />
          )}

          {currentPage === 'admin' && (
            <AdminPortalView
              onNavigate={handleNavigate}
              onViewPass={(apt) => setActiveAppointmentPass(apt)}
            />
          )}
        </main>

        {/* Doctor Detailed Credentials Modal */}
        <DoctorModal
          doctor={selectedDoctorModal}
          onClose={() => setSelectedDoctorModal(null)}
          onBook={(doc) => {
            setSelectedDoctorModal(null);
            handleBookWithDoctor(doc);
          }}
        />

        {/* Digital Appointment Pass Confirmation Modal */}
        <AppointmentPassModal
          appointment={activeAppointmentPass}
          onClose={() => setActiveAppointmentPass(null)}
          onGoToPortal={() => {
            setActiveAppointmentPass(null);
            handleNavigate('portal');
          }}
        />

        {/* Clinical Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>
    </AuthProvider>
  );
}
