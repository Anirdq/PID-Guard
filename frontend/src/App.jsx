import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PromptInput from "./components/PromptInput";
import ResultCard from "./components/ResultCard";
import Dashboard from "./components/Dashboard";
import { detectInjection } from "./api";
import "./index.css";
import "./App.css";

/* ─── How It Works Data ──────────────────────────── */
const HOW_IT_WORKS = [
  { num: "01", title: "Deep Learning Classifier", body: "Classifies the prompt using a fine-tuned Hugging Face DeBERTa-v3 neural network pipeline. High ML deviation signals prompt injection." },
  { num: "02", title: "Behavioral Fallback", body: "Scans 30+ syntactic patterns across 7 attack categories — instruction override, jailbreak, system prompt leak, and more." },
  { num: "03", title: "Adaptive Risk Scoring", body: "Intelligently combines ML probability with syntactic behavior metrics, generating a final 0–100% risk score." },
  { num: "04", title: "Enterprise Reliability", body: "Every interaction is verified with API keys, rate-limited by SlowAPI, and persistently archived in a PostgreSQL database." },
];

/* ─── Detector Page ──────────────────────────────── */
function DetectorPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (prompt) => {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await detectInjection(prompt);
      setResult({ ...data, prompt });
    } catch (e) {
      if (e.code === "ERR_NETWORK") {
        setError("Cannot connect to API. Start the backend: uvicorn main:app --reload");
      } else {
        setError(e.response?.data?.detail || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      {/* Hero */}
      <section className="hero anim-fadeup">
        <div className="hero-eyebrow">
          <img src="/logo.svg" alt="PID-Guard" className="hero-logo" />
          <span className="hero-eyebrow-text">Prompt Injection Detection Platform</span>
        </div>
        <h1 className="hero-title">
          Detect <span className="hero-highlight">Injection Attacks</span>
          <br />in Real&nbsp;Time
        </h1>
        <p className="hero-body">
          Advanced deep learning classification + syntactic behavioral matching,
          powered by <code>protectai/deberta-v3</code>. Enterprise Grade.
        </p>
        <div className="hero-tags">
          {["Hugging Face", "DeBERTa Neural Net", "PostgreSQL", "FastAPI", "SlowAPI"].map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      </section>

      {/* Detector */}
      <PromptInput onSubmit={handleSubmit} loading={loading} />

      {error && <div className="err-alert anim-fadeup">{error}</div>}
      {result && <ResultCard result={result} />}

      {/* How it works */}
      <section className="hiw anim-fadeup">
        <p className="section-overline">How it works</p>
        <div className="grid-2 hiw-grid">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.num} className="card hiw-card">
              <span className="hiw-num">{s.num}</span>
              <h3 className="hiw-title">{s.title}</h3>
              <p className="hiw-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── App Root with Theme Provider ──────────────── */
export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("pid-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pid-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <BrowserRouter>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<DetectorPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
