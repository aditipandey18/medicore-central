import React from 'react';
import { PageView } from '../types/hospital';
import { ShieldCheck, Lock, MapPin, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Trust & Accreditation Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800/80">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-800/50 flex items-center justify-center text-teal-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">JCI & NABH Accredited</p>
              <p className="text-xs text-slate-400 mt-0.5">Gold Seal of Approval for international healthcare safety standards.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-800/50 flex items-center justify-center text-teal-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Level 1 Trauma Care</p>
              <p className="text-xs text-slate-400 mt-0.5">24/7 dedicated cardiothoracic, neuro, and pediatric resuscitation suites.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-800/50 flex items-center justify-center text-teal-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">HIPAA & GDPR Compliant</p>
              <p className="text-xs text-slate-400 mt-0.5">End-to-end client cryptographic protection for personal health records.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-800/50 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Magnet Nursing Hospital</p>
              <p className="text-xs text-slate-400 mt-0.5">Recognized for compassionate bedside clinical care and low nurse-to-patient ratios.</p>
            </div>
          </div>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-lg">
                M+
              </div>
              <span className="text-lg font-bold text-white tracking-tight">MediCore Central</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              MediCore Central is a multi-specialty tertiary teaching hospital committed to compassionate medical care, cutting-edge surgical robotics, and clinical research excellence.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                <span>800 Healthcare Boulevard, Metro Medical District, NY 10021</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-500 shrink-0" />
                <span>General Reception: +1 (800) 555-0142 (Ext. 0)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                <span>admissions@medicorecentral.org</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Hospital Navigation</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => { onNavigate('home'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer">
                  Hospital Overview
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('about'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer">
                  About Our Mission
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('departments'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer">
                  Clinical Departments
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('doctors'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer">
                  Distinguished Doctors
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('book'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer">
                  Schedule Appointment
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('portal'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer">
                  Secure Patient Records
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('admin'); window.scrollTo(0,0); }} className="text-teal-400 hover:text-teal-300 font-medium transition-colors cursor-pointer flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Staff Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Centers */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Specialty Institutes</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => { onNavigate('departments'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer text-left">
                  Cardiology & Vascular
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('departments'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer text-left">
                  Neurology & Brain Institute
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('departments'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer text-left">
                  Orthopedics & Joint Care
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('departments'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer text-left">
                  Comprehensive Cancer Care
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('departments'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer text-left">
                  Pediatrics & Neonatal ICU
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('departments'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer text-left">
                  Women’s Health & Maternity
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Patient Services</p>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-xs text-rose-400 font-semibold block">Trauma Ambulance</span>
                <span className="text-sm text-white font-mono font-semibold">+1 (800) 555-0199</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Average dispatch time: 6 mins</span>
              </div>
              <p className="text-xs text-slate-400">
                Visiting Hours: 08:00 AM – 08:30 PM daily. ICU visits restricted to designated family members.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Hairline & Legal Notices */}
        <div className="pt-8 border-t border-slate-900 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MediCore Central Health System. All clinical rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors">Patient Privacy Rights</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="hover:text-slate-300 transition-colors">HIPAA Notice of Privacy Practices</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="hover:text-slate-300 transition-colors">Non-Discrimination Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
