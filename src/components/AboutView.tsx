import React from 'react';
import { PageView } from '../types/hospital';
import { ShieldCheck, Award, Users, HeartPulse, Sparkles, CheckCircle2, Lock, Building2 } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (page: PageView) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
            <span>About MediCore Central</span>
            <span aria-hidden="true">·</span>
            <span>Academic Tertiary Teaching Hospital</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl">
            Redefining Healthcare Through Clinical Innovation & Compassionate Precision
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Founded with the belief that no patient should have to choose between advanced technological medicine and warm, personalized bedside empathy.
          </p>
        </div>
      </section>

      {/* Hospital History & Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              Our Clinical Heritage
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Three Decades of Lifesaving Medical Milestones
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              MediCore Central was established as a regional center of surgical excellence. Over the last 30 years, our hospital has grown into an international destination for complex cardiothoracic surgery, neurological trauma, and organ-preserving oncology.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Today, MediCore Central houses 550 tertiary hospital beds, 180 dedicated intensive care units, 14 hybrid surgical theaters, and an active clinical trials consortium partnering with leading global medical institutes.
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl font-bold text-slate-900 font-mono">550+</span>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">Inpatient Hospital Beds</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl font-bold text-teal-700 font-mono">14</span>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">Hybrid Operating Suites</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            <img
              src="/src/assets/images/hospital_hero_facade_1790329081029.jpg"
              alt="MediCore Central Campus"
              referrerPolicy="no-referrer"
              className="w-full h-96 object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-6 text-white">
              <span className="text-xs font-semibold text-teal-300 uppercase block mb-1">Central Medical Pavilion</span>
              <p className="text-sm font-medium">State-of-the-art campus featuring cleanroom positive air pressure, rooftop heliports, and healing courtyards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars of Clinical Governance */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              Guiding Principles
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              The Four Pillars of MediCore Central
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every procedure, patient interaction, and clinical protocol is governed by our institutional standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero-Compromise Safety</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stringent clinical checklists, robotic surgical verification, and real-time vital telemetry to eliminate medical errors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multidisciplinary Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complex tumor boards and cardiac panels meet weekly to formulate individualized care plans for every oncology and surgical patient.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Patient Data Sovereignty</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Client-side encrypted health records, strict HIPAA audit logs, and instant patient authorization controls over health records.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Academic Translation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Translating bench research into bedside clinical treatments faster through active institutional research protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Executive Medical Board */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            Executive Governance
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Hospital Leadership & Clinical Directorate
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Our clinical directors combine decades of frontline surgical mastery with healthcare administration leadership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base">
                EV
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Dr. Elena Vance, MD</h3>
                <p className="text-xs text-teal-700 font-medium">Chief Medical Officer & Chair of Cardiology</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Oversees all clinical quality protocols, residency teaching accreditations, and cardiovascular surgical standards across the health system.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base">
                JS
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Dr. Julian Sterling, MD</h3>
                <p className="text-xs text-teal-700 font-medium">Chief of Surgery & Robotic Program Director</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Leads the 14 hybrid surgical operating theaters, surgical robotics credentialing, and emergency trauma surgical preparedness.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base">
                VR
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Dr. Victor Reyes, MD</h3>
                <p className="text-xs text-teal-700 font-medium">Director of Emergency & Disaster Services</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Directs the Level 1 Trauma Center, emergency mass-casualty triage, and integrated medical airlift operations.
            </p>
          </div>
        </div>
      </section>

      {/* Patient Rights & Safety Charter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 block">
              Commitment to Patients
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              MediCore Central Patient Rights & Safety Charter
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We uphold the dignity, confidentiality, and cultural identity of every patient entrusted to our care. You have the right to comprehensive clinical explanations, immediate access to all diagnostic records, and complete transparency regarding consultation fees and procedural outcomes.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Informed Consent Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Non-Discrimination Policy
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Instant Access to Digital EHR
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
