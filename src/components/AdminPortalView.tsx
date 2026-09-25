import React, { useState, useEffect } from 'react';
import { Appointment, Doctor, Department, PageView } from '../types/hospital';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { 
  getAllAppointments, recordNewAppointment, updateAppointmentStatus, 
  generateReferenceId, generatePinCode, logAuditAction 
} from '../utils/security';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  ShieldCheck, Lock, LogIn, LogOut, Search, Filter, Plus, Calendar, 
  Clock, User, Phone, Mail, CheckCircle2, XCircle, AlertCircle, 
  Building, ChevronRight, Eye, RefreshCw, Printer, Trash2, Edit3, X, Check
} from 'lucide-react';

const ADMIN_EMAIL = 'l01403016@gmail.com';
const ADMIN_PASSWORD = 'Password0909';
const STORAGE_KEY_ADMIN_LOGGED_IN = 'medicore_admin_authenticated';

interface AdminPortalViewProps {
  onNavigate: (page: PageView) => void;
  onViewPass: (appointment: Appointment) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  onNavigate,
  onViewPass
}) => {
  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEY_ADMIN_LOGGED_IN) === 'true';
  });

  // Login Form State
  const [inputEmail, setInputEmail] = useState<string>('l01403016@gmail.com');
  const [inputPassword, setInputPassword] = useState<string>('Password0909');
  const [loginError, setLoginError] = useState<string>('');

  // Bookings State
  const [appointments, setAppointments] = useState<Appointment[]>(getAllAppointments());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Modals
  const [showAddBookingModal, setShowAddBookingModal] = useState<boolean>(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Appointment | null>(null);

  // Sync bookings from Firestore + local store
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    try {
      const unsubscribe = onSnapshot(collection(db, 'appointments'), (snapshot) => {
        const firestoreApts: Appointment[] = [];
        snapshot.forEach((d) => {
          firestoreApts.push(d.data() as Appointment);
        });

        if (firestoreApts.length > 0) {
          // Merge with local appointments
          const map = new Map<string, Appointment>();
          getAllAppointments().forEach(a => map.set(a.id, a));
          firestoreApts.forEach(a => map.set(a.id, a));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setAppointments(merged);
        } else {
          setAppointments(getAllAppointments());
        }
      }, (error) => {
        console.warn('Firestore real-time listener fallback:', error);
        setAppointments(getAllAppointments());
      });

      return () => unsubscribe();
    } catch {
      setAppointments(getAllAppointments());
    }
  }, [isAdminLoggedIn]);

  // Admin Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && inputPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem(STORAGE_KEY_ADMIN_LOGGED_IN, 'true');
      setLoginError('');
      logAuditAction('ADMIN_LOGIN_SUCCESS', true, `Admin ${ADMIN_EMAIL} signed into Central Portal`);
    } else {
      setLoginError('Invalid Administrator credentials. Only authorized personnel may access.');
      logAuditAction('ADMIN_LOGIN_FAILED', false, `Unauthorized access attempt with email: ${inputEmail}`);
    }
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem(STORAGE_KEY_ADMIN_LOGGED_IN);
    logAuditAction('ADMIN_LOGOUT', true, `Admin ${ADMIN_EMAIL} logged out`);
  };

  // Status Change Handler
  const handleStatusChange = async (appointmentId: string, newStatus: 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled') => {
    updateAppointmentStatus(appointmentId, newStatus);
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a));

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), { status: newStatus });
      logAuditAction('ADMIN_STATUS_CHANGE', true, `Appointment ${appointmentId} updated to ${newStatus} by Admin`);
    } catch (err) {
      console.warn('Updated status locally:', err);
    }
  };

  // Delete Booking Handler
  const handleDeleteBooking = async (appointmentId: string) => {
    if (confirm(`Are you sure you want to permanently delete appointment reference ${appointmentId}?`)) {
      setAppointments(prev => prev.filter(a => a.id !== appointmentId));
      try {
        await deleteDoc(doc(db, 'appointments', appointmentId));
      } catch (err) {
        console.warn('Deleted locally:', err);
      }
      logAuditAction('ADMIN_DELETED_BOOKING', true, `Appointment ${appointmentId} deleted by Admin`);
    }
  };

  // Filter Logic
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDept = departmentFilter === 'all' || apt.departmentId === departmentFilter;

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = apt.date === todayStr;
    } else if (dateFilter === 'tomorrow') {
      matchesDate = apt.date === tomorrowStr;
    } else if (dateFilter === 'upcoming') {
      matchesDate = apt.date >= todayStr;
    }

    return matchesSearch && matchesStatus && matchesDept && matchesDate;
  });

  // Analytics Metrics
  const totalCount = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'Confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <section className="bg-slate-900 text-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>MediCore Central · Administrative Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hospital Operations & Booking Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Restricted management console for authorized clinical coordinators and hospital administrators.
            </p>
          </div>

          {isAdminLoggedIn && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs text-slate-300 block">Logged in as Administrator</span>
                <span className="text-xs font-mono font-semibold text-teal-300">{ADMIN_EMAIL}</span>
              </div>
              <button
                onClick={handleAdminLogout}
                className="px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/70 border border-rose-800 rounded-lg hover:bg-rose-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Admin Logout</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {!isAdminLoggedIn ? (
          /* Admin Sign In Gate */
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-slate-900 text-teal-400 rounded-xl flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Administrator Portal Login</h2>
              <p className="text-xs text-slate-500">
                Please enter authorized credentials to access clinical schedules, patient bookings, and administrative operations.
              </p>
            </div>

            {/* Quick Demo Pre-fill notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Authorized Administrator Access:</span>
              <p className="text-slate-600">
                Email: <strong className="font-mono text-slate-900">{ADMIN_EMAIL}</strong>
              </p>
              <p className="text-slate-600">
                Password: <strong className="font-mono text-slate-900">{ADMIN_PASSWORD}</strong>
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  required
                  placeholder="admin@medicorecentral.org"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                  Security Password
                </label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-900 font-mono"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Admin Portal</span>
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigate('home')}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ← Return to Public Website
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Management Interface */
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Bookings</span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">{totalCount}</span>
                <span className="text-xs text-slate-400 block">All recorded consultations</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-teal-700 uppercase block">Confirmed Visits</span>
                <span className="text-2xl sm:text-3xl font-bold text-teal-700 font-mono tabular-nums">{confirmedCount}</span>
                <span className="text-xs text-slate-400 block">Scheduled & active</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-700 uppercase block">Completed</span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-700 font-mono tabular-nums">{completedCount}</span>
                <span className="text-xs text-slate-400 block">Successfully attended</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-rose-700 uppercase block">Cancelled</span>
                <span className="text-2xl sm:text-3xl font-bold text-rose-700 font-mono tabular-nums">{cancelledCount}</span>
                <span className="text-xs text-slate-400 block">Cancelled or no-show</span>
              </div>
            </div>

            {/* Actions & Filters Strip */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Patient Name, Phone, Email, Reference ID, or Physician..."
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Add Booking Button from Admin End */}
                <button
                  onClick={() => setShowAddBookingModal(true)}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Booking (Admin End)</span>
                </button>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800"
                  >
                    <option value="all">All Departments</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.shortName}</option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Date:</span>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>

                {(statusFilter !== 'all' || departmentFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setDepartmentFilter('all');
                      setDateFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-teal-700 hover:underline cursor-pointer ml-auto font-medium"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Bookings Management Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Appointment Records ({filteredAppointments.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click status to change, view patient pass, or add medical triage notes.
                  </p>
                </div>
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">No appointments matching filters</p>
                  <p className="text-xs text-slate-500">Try loosening your search criteria or add a new booking.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Ref #</th>
                        <th className="py-3 px-4">Patient Details</th>
                        <th className="py-3 px-4">Department & Doctor</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Mode / Room</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Reference ID & Code */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 block">{apt.id}</span>
                            <span className="text-[11px] font-mono text-slate-400">PIN: {apt.accessCode}</span>
                          </td>

                          {/* Patient Details */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                            <span className="text-slate-500 font-mono text-[11px] block">{apt.patientPhone}</span>
                            <span className="text-slate-400 text-[11px] block">{apt.patientEmail}</span>
                          </td>

                          {/* Department & Doctor */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-teal-900 block">{apt.doctorName}</span>
                            <span className="text-slate-500 text-[11px] block">{apt.departmentName}</span>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            <span className="block">{apt.date}</span>
                            <span className="text-slate-500 text-[11px] block font-mono">{apt.timeSlot}</span>
                          </td>

                          {/* Mode / Room */}
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-700 block">{apt.consultationType}</span>
                            <span className="text-slate-400 text-[11px] block truncate max-w-[130px]">{apt.roomNumber}</span>
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-3.5 px-4">
                            <select
                              value={apt.status}
                              onChange={(e) => handleStatusChange(apt.id, e.target.value as any)}
                              className={`py-1 px-2 rounded-md font-semibold text-xs border cursor-pointer ${
                                apt.status === 'Confirmed'
                                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                                  : apt.status === 'Completed'
                                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                                  : apt.status === 'Rescheduled'
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : 'bg-rose-50 border-rose-200 text-rose-800'
                              }`}
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Rescheduled">Rescheduled</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedBookingForDetails(apt)}
                                title="View Details & Notes"
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onViewPass(apt)}
                                title="Print / Digital Pass"
                                className="p-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteBooking(apt.id)}
                                title="Delete Record"
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD BOOKING FROM ADMIN END */}
      {showAddBookingModal && (
        <AddBookingAdminModal
          onClose={() => setShowAddBookingModal(false)}
          onAdded={(newApt) => {
            setAppointments(prev => [newApt, ...prev]);
            setShowAddBookingModal(false);
          }}
        />
      )}

      {/* MODAL 2: VIEW BOOKING DETAILS & NOTES */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 p-6 space-y-5 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-teal-700 uppercase font-semibold">Appointment Ref: {selectedBookingForDetails.id}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedBookingForDetails.patientName}</h3>
                <span className="text-slate-400 font-mono">PIN: {selectedBookingForDetails.accessCode}</span>
              </div>
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Department</span>
                <span className="font-semibold text-slate-900">{selectedBookingForDetails.departmentName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Assigned Physician</span>
                <span className="font-semibold text-slate-900">{selectedBookingForDetails.doctorName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Date & Time</span>
                <span className="font-semibold text-slate-900">{selectedBookingForDetails.date} at {selectedBookingForDetails.timeSlot}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Location</span>
                <span className="font-semibold text-slate-900">{selectedBookingForDetails.roomNumber}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block uppercase font-bold mb-1">Chief Complaint & Symptoms</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                {selectedBookingForDetails.symptoms || 'None specified.'}
              </p>
            </div>

            {selectedBookingForDetails.notes && (
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-bold mb-1">Clinical Preparation Notes</span>
                <p className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 leading-relaxed">
                  {selectedBookingForDetails.notes}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">
                Created on {new Date(selectedBookingForDetails.createdAt).toLocaleString()}
              </span>
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
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

// Subcomponent: Add Booking Modal from Admin End
interface AddBookingAdminModalProps {
  onClose: () => void;
  onAdded: (appointment: Appointment) => void;
}

const AddBookingAdminModal: React.FC<AddBookingAdminModalProps> = ({ onClose, onAdded }) => {
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [departmentId, setDepartmentId] = useState(DEPARTMENTS[0].id);
  const [doctorId, setDoctorId] = useState('');
  
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [date, setDate] = useState(tomorrow);
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [consultationType, setConsultationType] = useState<'In-Person Clinic' | 'Telehealth Video'>('In-Person Clinic');
  const [symptoms, setSymptoms] = useState('Admin reservation / Clinical referral');
  const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'Follow-up'>('Routine');
  const [notes, setNotes] = useState('Scheduled via Administrative Directorate.');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDeptDoctors = DOCTORS.filter(d => d.departmentId === departmentId);
  const selectedDoctor = DOCTORS.find(d => d.id === doctorId) || currentDeptDoctors[0];
  const selectedDept = DEPARTMENTS.find(d => d.id === departmentId);

  useEffect(() => {
    if (currentDeptDoctors.length > 0 && (!doctorId || selectedDoctor.departmentId !== departmentId)) {
      setDoctorId(currentDeptDoctors[0].id);
    }
  }, [departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return alert('Patient Name is required');
    if (!selectedDoctor || !selectedDept) return;

    setIsSubmitting(true);
    try {
      const newApt: Appointment = {
        id: generateReferenceId(),
        userId: 'admin_created',
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim() || 'walkin@medicorecentral.org',
        patientPhone: patientPhone.trim() || '+1 (800) 555-0142',
        patientDob: '1988-01-01',
        patientGender: 'Other',
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date,
        timeSlot,
        consultationType,
        symptoms,
        urgency,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        accessCode: generatePinCode(),
        roomNumber: selectedDoctor.room,
        notes
      };

      // Store in Firestore and local registry
      recordNewAppointment(newApt);
      try {
        await setDoc(doc(db, 'appointments', newApt.id), newApt);
      } catch (err) {
        console.warn('Saved to local store:', err);
      }

      logAuditAction('ADMIN_CREATED_BOOKING', true, `New appointment ${newApt.id} created from Admin End for ${patientName}`);
      onAdded(newApt);
    } catch (err) {
      console.error(err);
      alert('Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6 space-y-5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">Admin Reservation</span>
            <h3 className="text-base font-bold text-slate-900">Add New Patient Booking</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Patient Legal Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Robert Henderson"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Patient Email</label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Contact Phone</label>
              <input
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+1 (555) 019-2831"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Clinical Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Physician</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              >
                {currentDeptDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Time Slot</label>
              <input
                type="text"
                required
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="10:00 AM"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Consultation Mode</label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              >
                <option value="In-Person Clinic">In-Person Clinic</option>
                <option value="Telehealth Video">Telehealth Video</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Priority</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Reason for Visit / Symptoms</label>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Administrative Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Registering Booking...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
