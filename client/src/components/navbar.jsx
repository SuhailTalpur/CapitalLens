import React, { useState } from 'react';
import { Newspaper, TrendingUp, Rocket, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = ({ activeSection = 'news', onSectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'News', icon: <Newspaper size={18} />, section: 'news' },
    { name: 'Stocks', icon: <TrendingUp size={18} />, section: 'stocks' },
    { name: 'Startups', icon: <Rocket size={18} />, section: 'startups' },
  ];

  const handleNavClick = (section) => {
    onSectionChange?.(section);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Area */}
          <div className="shrink-0 flex items-center gap-1 group cursor-pointer">
            <div className="rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <img src={logo} alt="CapitalLens Logo" className='w-14'/>
            </div>
            <span className="text-2xl font-medium tracking-tight text-white bg-clip-text">
              CapitalLens
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.section)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20"
                >
                  {link.icon}
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-black/90 border-b border-white/10 animate-in fade-in slide-in-from-top-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.section)}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
              >
                {link.icon}
                {link.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;