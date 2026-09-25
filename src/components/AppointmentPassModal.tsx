import React from 'react';
import { Appointment } from '../types/hospital';
import { CheckCircle, Calendar, Clock, MapPin, QrCode, Printer, Download, ShieldCheck, ArrowRight, User } from 'lucide-react';

interface AppointmentPassModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onGoToPortal: () => void;
}

export const AppointmentPassModal: React.FC<AppointmentPassModalProps> = ({
  appointment,
  onClose,
  onGoToPortal
}) => {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCalendar = () => {
    // Generate simple .ics calendar file
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MediCore Central//Hospital Appointment//EN',
      'BEGIN:VEVENT',
      `SUMMARY:MediCore Central: Dr. ${appointment.doctorName}`,
      `DESCRIPTION:Appointment Ref: ${appointment.id}. Dept: ${appointment.departmentName}. Location: ${appointment.roomNumber}. Urgency: ${appointment.urgency}`,
      `LOCATION:MediCore Central, ${appointment.roomNumber}, 800 Healthcare Blvd`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${appointment.id}_appointment.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Pass Header */}
        <div className="bg-teal-700 text-white p-6 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              Official Clinical Pass
            </span>
            <span className="text-xs font-mono bg-teal-800/80 px-2.5 py-0.5 rounded text-teal-100">
              {appointment.status}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-300 shrink-0" />
            <span>Appointment Confirmed</span>
          </h2>
          <p className="text-xs text-teal-100 mt-1">
            Reference #{appointment.id} · Access PIN: <strong className="font-mono text-white underline">{appointment.accessCode}</strong>
          </p>
        </div>

        {/* Pass Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Patient and Doctor Details */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase block">Patient</span>
              <span className="text-sm font-semibold text-slate-900 block truncate">{appointment.patientName}</span>
              <span className="text-xs text-slate-500 font-mono">{appointment.patientPhone}</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase block">Physician</span>
              <span className="text-sm font-semibold text-teal-900 block truncate">{appointment.doctorName}</span>
              <span className="text-xs text-slate-500">{appointment.departmentName}</span>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Date & Time
              </span>
              <span className="text-xs font-semibold text-slate-900 block">
                {appointment.date}
              </span>
              <span className="text-xs font-medium text-slate-700 block">
                {appointment.timeSlot} ({appointment.consultationType})
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Consultation Room
              </span>
              <span className="text-xs font-semibold text-slate-900 block">
                {appointment.roomNumber}
              </span>
              <span className="text-[11px] text-slate-500 block">
                MediCore Central Main Pavilion
              </span>
            </div>
          </div>

          {/* Verification Barcode & QR code simulation */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">Hospital Check-In Pass</span>
              <p className="text-[11px] text-slate-500">
                Present this QR code or Reference ID at the self-service kiosk upon arrival.
              </p>
            </div>
            <div className="w-16 h-16 bg-slate-900 text-white rounded-lg p-2 flex items-center justify-center shrink-0">
              <QrCode className="w-12 h-12" />
            </div>
          </div>

          {/* Clinical Instructions Notice */}
          <div className="text-xs text-slate-500 bg-amber-50/70 border border-amber-200/70 rounded-lg p-3">
            <span className="font-semibold text-amber-900 block mb-0.5">Patient Preparation Notice:</span>
            Please arrive 15 minutes before your scheduled slot. Bring photo identification, medical insurance card, and any relevant prior imaging or test reports.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={handleDownloadCalendar}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Add to Calendar</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onGoToPortal();
              }}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>View in Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
