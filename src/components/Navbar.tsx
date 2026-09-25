import React, { useState } from 'react';
import { PageView } from '../types/hospital';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { Phone, Shield, Menu, X, Calendar, UserCheck, LogIn, LogOut, User, Lock } from 'lucide-react';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, userProfile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks: { label: string; page: PageView }[] = [
    { label: 'Home', page: 'home' },
    { label: 'About', page: 'about' },
    { label: 'Departments', page: 'departments' },
    { label: 'Doctors', page: 'doctors' },
    { label: 'Patient Portal', page: 'portal' },
  ];

  const handleNavClick = (page: PageView) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      {/* Top Clinical Alert / Contact Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-teal-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Level 1 Trauma & Emergency: 24/7 Open
            </span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:inline text-slate-300">
              Emergency Direct Line: <a href="tel:8005550199" className="text-white font-medium hover:text-teal-300 transition-colors">+1 (800) 555-0199</a>
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">JCI Gold Seal & NABH Certified</span>
            <span className="hidden sm:inline">·</span>
            <button 
              onClick={() => handleNavClick('portal')}
              className="flex items-center gap-1 text-slate-300 hover:text-teal-300 transition-colors text-xs font-medium cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Patient Records</span>
            </button>
            <span className="hidden sm:inline">·</span>
            <button 
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1 transition-colors text-xs font-semibold cursor-pointer ${
                currentPage === 'admin' ? 'text-teal-300 underline' : 'text-slate-300 hover:text-teal-300'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main One-Row Three-Zone Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Zone 1: Single element brand wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-teal-800 transition-colors">
            <span className="tracking-tight text-white flex items-center">
              M<span className="text-teal-200">+</span>
            </span>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-900 transition-colors block leading-tight">
              MediCore Central
            </span>
            <span className="text-[11px] font-medium text-slate-500 block -mt-0.5 tracking-wider uppercase">
              Tertiary Medical Center
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavClick(link.page)}
              className={`transition-colors py-1 cursor-pointer relative ${
                currentPage === link.page
                  ? 'text-teal-800 font-semibold'
                  : 'hover:text-slate-950 text-slate-600'
              }`}
            >
              {link.label}
              {currentPage === link.page && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions & User Auth */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('portal')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-medium text-slate-800"
              >
                <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {(user.displayName || user.email || 'P')[0].toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate font-semibold">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>
              <button
                onClick={signOut}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-600" />
              <span>Sign In / Register</span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('book')}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 active:scale-98 transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => handleNavClick('book')}
            className="sm:hidden px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNavClick(link.page)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === link.page
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-teal-600" />
                  <span>Sign In or Sign Up</span>
                </button>
              )}

              <button
                onClick={() => handleNavClick('book')}
                className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              <button
                onClick={() => handleNavClick('admin')}
                className="w-full py-2 px-4 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Admin Operations Portal</span>
              </button>

              <a
                href="tel:8005550199"
                className="w-full py-2 px-4 text-center text-xs font-medium text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Emergency 24/7: +1 (800) 555-0199</span>
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
};
