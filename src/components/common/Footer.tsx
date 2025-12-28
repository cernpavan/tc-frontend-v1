import { Link } from 'react-router-dom';
import { Shield, Lock, FileText } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 py-8 border-t border-dark-800">
      <div className="max-w-3xl mx-auto px-4">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6">
          <Link
            to="/terms"
            className="flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors text-sm"
          >
            <FileText size={16} />
            Terms & Conditions
          </Link>
          <Link
            to="/terms#privacy"
            className="flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors text-sm"
          >
            <Lock size={16} />
            Privacy Policy
          </Link>
          <Link
            to="/terms#content"
            className="flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors text-sm"
          >
            <Shield size={16} />
            Content Policy
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-800 pt-6">
          {/* Copyright */}
          <div className="text-center">
            <p className="text-dark-500 text-sm">
              {currentYear} Telugu Anonymous Confession Platform. All rights reserved.
            </p>
            <p className="text-dark-600 text-xs mt-2">
              An anonymous platform for the Telugu community. 18+ only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
