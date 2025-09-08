// components/Footer.tsx
import React from 'react';


const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background text-foreground py-6 px-4 md:px-6 mt-auto ">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Brand + Tagline */}
        <div className="text-center md:text-left">
          <h3 className="text-sm font-bold text-primary">Luna Skin Aesthetics</h3>
          <p className="text-xs text-muted-foreground italic">Appointment Manager — Glow with Confidence</p>
        </div>

        {/* Credits + Copyright */}
        <div className="text-center md:text-right space-y-1">
          <p className="text-sm text-muted-foreground">
            Developed with <span className="text-destructive">❤️</span> by <strong>Mangalshwaran</strong> @ <strong>Zenotra</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Luna Skin Aesthetics. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;