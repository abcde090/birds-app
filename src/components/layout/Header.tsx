import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Map' },
  { to: '/catalog', label: 'Catalog' },
];

export default function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 bg-sand-100/90 backdrop-blur-md border-b border-sand-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-serif font-bold text-bark-900">
          <span aria-hidden="true">🪶</span>
          Aussie Birds
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'text-eucalyptus-500 border-b-2 border-eucalyptus-500 pb-0.5'
                  : 'text-bark-700 hover:text-eucalyptus-500'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-bark-900 transition-transform ${
              menuOpen ? 'translate-y-1.5 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-bark-900 transition-opacity ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-bark-900 transition-transform ${
              menuOpen ? '-translate-y-1.5 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-sand-300 bg-sand-100/95 backdrop-blur-md px-4 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium ${
                isActive(link.to)
                  ? 'text-eucalyptus-500'
                  : 'text-bark-700 hover:text-eucalyptus-500'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
