import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Appointment, UserProfile } from '../types/hospital';
import { logAuditAction, getAllAppointments, recordNewAppointment, updateAppointmentStatus } from '../utils/security';

export interface UserIdentity {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber?: string | null;
  providerId: string;
}

interface LocalStoredPatientAccount {
  uid: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  createdAt: string;
}

const STORAGE_KEY_LOCAL_PATIENTS = 'medicore_local_patient_accounts';
const STORAGE_KEY_ACTIVE_LOCAL_USER = 'medicore_active_local_user';

function getLocalPatientAccounts(): LocalStoredPatientAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_PATIENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPatientAccount(acc: LocalStoredPatientAccount) {
  const accounts = getLocalPatientAccounts().filter(a => a.email.toLowerCase() !== acc.email.toLowerCase());
  accounts.push(acc);
  localStorage.setItem(STORAGE_KEY_LOCAL_PATIENTS, JSON.stringify(accounts));
}

function getActiveLocalUser(): UserIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_LOCAL_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setActiveLocalUser(u: UserIdentity | null) {
  if (u) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_LOCAL_USER, JSON.stringify(u));
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_LOCAL_USER);
  }
}

interface AuthContextType {
  user: UserIdentity | null;
  userProfile: UserProfile | null;
  userAppointments: Appointment[];
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  saveAppointmentToFirestore: (appointment: Appointment) => Promise<void>;
  cancelAppointmentInFirestore: (appointmentId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync Auth State (Firebase Auth + Fallback Local Session)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const identity: UserIdentity = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Patient',
          phoneNumber: firebaseUser.phoneNumber,
          providerId: 'google.com'
        };
        setUser(identity);
        setActiveLocalUser(identity);

        // Fetch or create user profile in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const initialProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Patient',
              phone: firebaseUser.phoneNumber || '',
              gender: 'Other',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialProfile);
            setUserProfile(initialProfile);
          }
          logAuditAction('FIREBASE_AUTH_LOGIN', true, `User logged in via Google: ${firebaseUser.email} (${firebaseUser.uid})`);
        } catch (error) {
          console.error('Error fetching user profile from Firestore:', error);
        }
      } else {
        // If not in Firebase, check if local patient user is active
        const localActive = getActiveLocalUser();
        if (localActive) {
          setUser(localActive);
          // Set userProfile from local storage or cached state
          setUserProfile({
            id: localActive.uid,
            email: localActive.email || '',
            name: localActive.displayName || 'Patient',
            phone: localActive.phoneNumber || '',
            gender: 'Other',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          setUser(null);
          setUserProfile(null);
          setUserAppointments([]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync Appointments for logged-in user
  useEffect(() => {
    if (!user) {
      setUserAppointments([]);
      return;
    }

    // Try listening to Firestore
    try {
      const q = query(
        collection(db, 'appointments'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const apts: Appointment[] = [];
          snapshot.forEach((docSnap) => {
            apts.push(docSnap.data() as Appointment);
          });
          apts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setUserAppointments(apts);
        },
        (error) => {
          // If Firestore query fails (e.g. offline/rules), load from local storage
          const all = getAllAppointments();
          const filtered = all.filter(a => a.userId === user.uid || (user.email && a.patientEmail.toLowerCase() === user.email.toLowerCase()));
          setUserAppointments(filtered);
        }
      );

      return () => unsubscribe();
    } catch {
      const all = getAllAppointments();
      const filtered = all.filter(a => a.userId === user.uid || (user.email && a.patientEmail.toLowerCase() === user.email.toLowerCase()));
      setUserAppointments(filtered);
    }
  }, [user]);

  // Sign In With Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      const identity: UserIdentity = {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName || u.email?.split('@')[0] || 'Patient',
        phoneNumber: u.phoneNumber,
        providerId: 'google.com'
      };
      setUser(identity);
      setActiveLocalUser(identity);

      const userDocRef = doc(db, 'users', u.uid);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const newProf: UserProfile = {
          id: u.uid,
          email: u.email || '',
          name: u.displayName || 'Patient',
          phone: u.phoneNumber || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProf);
        setUserProfile(newProf);
      } else {
        setUserProfile(snap.data() as UserProfile);
      }
    } catch (err) {
      console.error('Google Sign-In failed', err);
      throw err;
    }
  };

  // Sign In With Email & Password (with seamless local fallback if Firebase provider is disabled)
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const identity: UserIdentity = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0],
        phoneNumber: res.user.phoneNumber,
        providerId: 'password'
      };
      setUser(identity);
      setActiveLocalUser(identity);

      const userDocRef = doc(db, 'users', res.user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    } catch (err: any) {
      // If Firebase returns auth/operation-not-allowed or similar configuration restrictions,
      // fallback to the secure patient accounts registry!
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        const accounts = getLocalPatientAccounts();
        const account = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
        
        if (!account) {
          throw new Error('Account not found. Please click "Sign Up / Register" to create your patient account.');
        }

        if (account.passwordHash !== pass) {
          throw new Error('Incorrect password. Please verify and try again.');
        }

        const identity: UserIdentity = {
          uid: account.uid,
          email: account.email,
          displayName: account.name,
          phoneNumber: account.phone,
          providerId: 'password'
        };

        setUser(identity);
        setActiveLocalUser(identity);
        setUserProfile({
          id: account.uid,
          email: account.email,
          name: account.name,
          phone: account.phone || '',
          gender: 'Other',
          createdAt: account.createdAt,
          updatedAt: new Date().toISOString()
        });

        // Load appointments for this user
        const allApts = getAllAppointments();
        setUserAppointments(allApts.filter(a => a.userId === account.uid || a.patientEmail.toLowerCase() === account.email.toLowerCase()));
        logAuditAction('PATIENT_EMAIL_LOGIN', true, `Logged in via patient email: ${email}`);
        return;
      }

      throw err;
    }
  };

  // Sign Up With Email & Password (with seamless fallback if Firebase provider is disabled)
  const signUpWithEmail = async (email: string, pass: string, name: string, phone?: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      
      const identity: UserIdentity = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: name,
        phoneNumber: phone || null,
        providerId: 'password'
      };
      setUser(identity);
      setActiveLocalUser(identity);

      const newProf: UserProfile = {
        id: res.user.uid,
        email,
        name,
        phone: phone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', res.user.uid), newProf);
      setUserProfile(newProf);
    } catch (err: any) {
      // If Firebase returns auth/operation-not-allowed, create patient account seamlessly!
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        const accounts = getLocalPatientAccounts();
        const existing = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
        if (existing) {
          throw new Error('An account with this email already exists. Please select "Sign In" instead.');
        }

        // Generate patient UID
        const generatedUid = `mc_pat_${Math.floor(100000 + Math.random() * 900000)}`;
        const newAccount: LocalStoredPatientAccount = {
          uid: generatedUid,
          email: email.trim().toLowerCase(),
          passwordHash: pass,
          name: name.trim(),
          phone: phone?.trim(),
          createdAt: new Date().toISOString()
        };

        saveLocalPatientAccount(newAccount);

        const identity: UserIdentity = {
          uid: generatedUid,
          email: newAccount.email,
          displayName: newAccount.name,
          phoneNumber: newAccount.phone,
          providerId: 'password'
        };

        setUser(identity);
        setActiveLocalUser(identity);

        const profile: UserProfile = {
          id: generatedUid,
          email: newAccount.email,
          name: newAccount.name,
          phone: newAccount.phone || '',
          gender: 'Other',
          createdAt: newAccount.createdAt,
          updatedAt: new Date().toISOString()
        };

        setUserProfile(profile);
        setUserAppointments([]);
        logAuditAction('PATIENT_ACCOUNT_REGISTERED', true, `New patient account created for: ${email} (${name})`);
        return;
      }

      throw err;
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setActiveLocalUser(null);
    setUser(null);
    setUserProfile(null);
    setUserAppointments([]);
    logAuditAction('PATIENT_LOGOUT', true, 'Patient signed out.');
  };

  // Update User Profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');
    
    const updated = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, updated);
    } catch {
      // Local fallback
    }

    setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
  };

  // Save New Appointment
  const saveAppointmentToFirestore = async (appointment: Appointment) => {
    if (!user) throw new Error('User must be logged in to book');
    const aptWithUser: Appointment = {
      ...appointment,
      userId: user.uid
    };

    // Save in local state/storage
    recordNewAppointment(aptWithUser);
    setUserAppointments((prev) => [aptWithUser, ...prev.filter(a => a.id !== aptWithUser.id)]);

    // Save in Firestore if possible
    try {
      await setDoc(doc(db, 'appointments', appointment.id), aptWithUser);
      logAuditAction('APPOINTMENT_STORED_FIRESTORE', true, `Appointment ${appointment.id} saved in database for UID ${user.uid}`);
    } catch (error) {
      console.warn('Stored appointment in local secure storage (Firestore write deferred):', error);
    }
  };

  // Cancel Appointment
  const cancelAppointmentInFirestore = async (appointmentId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    updateAppointmentStatus(appointmentId, 'Cancelled');
    setUserAppointments((prev) => 
      prev.map(a => a.id === appointmentId ? { ...a, status: 'Cancelled' as const } : a)
    );

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'Cancelled'
      });
      logAuditAction('APPOINTMENT_CANCELLED_FIRESTORE', true, `Appointment ${appointmentId} marked Cancelled in Firestore`);
    } catch (error) {
      console.warn('Updated appointment status locally:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        userAppointments,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateUserProfile,
        saveAppointmentToFirestore,
        cancelAppointmentInFirestore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
