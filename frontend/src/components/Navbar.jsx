import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ theme, onToggleTheme }) {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // close menu on route change
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    const isDark = theme === "dark";

    return (
        <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
            <div className="container navbar-inner">
                {/* Brand */}
                <Link to="/" className="navbar-brand">
                    <img src="/logo.svg" alt="PID-Guard Logo" className="brand-logo" />
                    <span className="brand-name">
                        PID<span className="brand-accent">-Guard</span>
                    </span>
                    <span className="brand-pill">v1.0</span>
                </Link>

                {/* Desktop links */}
                <div className="navbar-links desktop-links">
                    <Link to="/" className={`nav-link ${location.pathname === "/" ? "nav-active" : ""}`}>
                        Detector
                    </Link>
                    <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "nav-active" : ""}`}>
                        Dashboard
                    </Link>
                    <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="nav-link nav-external">
                        API Docs ↗
                    </a>
                    <div className="nav-divider" />
                    <button className="btn btn-icon theme-toggle" onClick={onToggleTheme} title="Toggle theme" aria-label="Toggle theme">
                        {isDark ? "☀️" : "🌙"}
                    </button>
                </div>

                {/* Mobile controls */}
                <div className="mobile-controls">
                    <button className="btn btn-icon theme-toggle" onClick={onToggleTheme} title="Toggle theme" aria-label="Toggle theme">
                        {isDark ? "☀️" : "🌙"}
                    </button>
                    <button
                        className={`btn btn-icon hamburger ${menuOpen ? "open" : ""}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="mobile-menu">
                    <Link to="/" className={`mobile-link ${location.pathname === "/" ? "nav-active" : ""}`}>
                        🔍 Detector
                    </Link>
                    <Link to="/dashboard" className={`mobile-link ${location.pathname === "/dashboard" ? "nav-active" : ""}`}>
                        📊 Dashboard
                    </Link>
                    <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="mobile-link">
                        📡 API Docs ↗
                    </a>
                </div>
            )}
        </nav>
    );
}
