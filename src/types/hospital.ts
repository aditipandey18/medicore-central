export type PageView = 'home' | 'about' | 'departments' | 'doctors' | 'book' | 'portal' | 'admin';

export interface Doctor {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  qualification: string;
  experienceYears: number;
  avatar: string;
  bio: string;
  specialties: string[];
  languages: string[];
  consultationFee: number;
  availableDays: string[];
  availableSlots: string[];
  room: string;
  rating: number;
  reviewsCount: number;
  awards: string[];
}

export interface Department {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  subspecialties: string[];
  keyFacilities: string[];
  floor: string;
  contactExt: string;
  emergencyPhone?: string;
  casesPerYear: string;
  successRate: string;
  icuBeds: string;
  iconName: string;
}

export interface Appointment {
  id: string;
  userId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientDob: string;
  patientGender: 'Male' | 'Female' | 'Other';
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  consultationType: 'In-Person Clinic' | 'Telehealth Video';
  symptoms: string;
  urgency: 'Routine' | 'Urgent' | 'Follow-up';
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';
  createdAt: string;
  accessCode: string;
  roomNumber: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalRecord {
  date: string;
  bloodPressure: string;
  heartRate: number;
  temperature: string;
  oxygenSaturation: number;
  respiratoryRate: number;
  bmi: number;
  recordedBy: string;
}

export interface DiagnosticReport {
  id: string;
  testName: string;
  category: 'Radiology' | 'Pathology' | 'Cardiology' | 'Biochemistry';
  date: string;
  orderingDoctor: string;
  status: 'Final' | 'Reviewed' | 'Pending Review';
  summary: string;
  findings: string[];
  specimenOrModality: string;
  flag?: 'Normal' | 'Attention' | 'Critical';
}

export interface PatientProfile {
  id: string; // e.g. MC-PAT-8941
  accessPin: string; // e.g. 7721
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: { name: string; dosage: string; frequency: string }[];
  emergencyContact: { name: string; relation: string; phone: string };
  appointments: Appointment[];
  vitalsHistory: VitalRecord[];
  diagnosticReports: DiagnosticReport[];
  hipaaConsentSigned: boolean;
  dataSharingPreferences: {
    researchParticipation: boolean;
    smsNotifications: boolean;
    telehealthRecording: boolean;
  };
}

export interface AccessAuditLog {
  timestamp: string;
  action: string;
  ipAddress: string;
  authorized: boolean;
  details: string;
}
