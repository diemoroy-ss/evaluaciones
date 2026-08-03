"use client";

import React, { useState, useEffect } from "react";
import { getSubjects, getEvaluations, getNotifications, Subject, Evaluation, EventNotification, isOfflineMode } from "@/lib/db";
import Calendar from "@/components/Calendar";
import EvaluationDetailModal from "@/components/EvaluationDetailModal";
import ScheduleModal from "@/components/ScheduleModal";
import NotificationDetailModal from "@/components/NotificationDetailModal";
import { 
  Calendar as CalendarIcon, 
  Settings, 
  Sun, 
  Moon, 
  BookOpen, 
  Clock, 
  ChevronRight,
  Loader2,
  AlertCircle,
  WifiOff,
  Clock3,
  X
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Data State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Schedule Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Selected Evaluation/Notification for Modal
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<EventNotification | null>(null);

  // Stats
  const [nextEvaluation, setNextEvaluation] = useState<Evaluation[] | any>(null);
  const [evalsCountThisMonth, setEvalsCountThisMonth] = useState(0);

  // Logo loading helper
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Load theme and fetch data on mount
  useEffect(() => {
    // 1. Theme initialization
    const savedTheme = localStorage.getItem("app_theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    // 2. Fetch Data
    fetchData();

    // 3. Set offline state on mount to avoid hydration mismatch
    setIsOffline(isOfflineMode);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSubjects = await getSubjects();
      const fetchedEvaluations = await getEvaluations();
      const fetchedNotifications = await getNotifications();
      
      setSubjects(fetchedSubjects);
      setEvaluations(fetchedEvaluations);
      setNotifications(fetchedNotifications);
      
      calculateStats(fetchedEvaluations);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar a la base de datos de Firebase.");
    } finally {
      setLoading(false);
      // Double check offline mode state after loading completes
      setIsOffline(isOfflineMode);
    }
  };

  const calculateStats = (evals: Evaluation[]) => {
    if (evals.length === 0) {
      setNextEvaluation(null);
      setEvalsCountThisMonth(0);
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    
    // 1. Next upcoming evaluation (excluding Actividades)
    const upcoming = evals
      .filter((ev) => ev.date >= todayStr && ev.category !== "Actividad")
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setNextEvaluation(upcoming.length > 0 ? upcoming[0] : null);

    // 2. Evaluations this month (excluding Actividades and meetings)
    const currentMonthStr = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const thisMonth = evals.filter((ev) => {
      const typeLower = ev.type.toLowerCase();
      const isActivity = ev.category === "Actividad";
      const isMeeting = typeLower === "reunión" || typeLower === "reunion";
      return ev.date.startsWith(currentMonthStr) && !isActivity && !isMeeting;
    });
    setEvalsCountThisMonth(thisMonth.length);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("app_theme", nextTheme);
  };

  return (
    <div className="app-container animate-fade">
      {/* Navigation Header */}
      <header className="main-header glass-panel">
        <div className="header-brand">
          <div className="brand-logo-wrapper logo-colegio-wrapper">
            <img 
              src="/logo-colegio.png" 
              alt="Logo Colegio" 
              className="brand-logo-img" 
              onLoad={() => setLogoLoaded(true)}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                setLogoLoaded(false);
              }}
              style={{ display: logoLoaded ? "block" : "none" }}
            />
            {!logoLoaded && (
              <CalendarIcon className="brand-logo" size={24} />
            )}
          </div>
          <div>
            <div className="title-row">
              <h1>Control de Evaluaciones</h1>
              {isOffline && (
                <span className="offline-badge" title="La conexión con Firestore falló o está inactiva. Usando base de datos local cached.">
                  <WifiOff size={10} />
                  <span>Base de Datos Local</span>
                </span>
              )}
            </div>
            <span className="brand-subtitle">Colegio Montahue Huechuraba -- Curso 3° Básico</span>
          </div>
        </div>

        <div className="header-controls">
          <button 
            onClick={() => setIsScheduleOpen(true)}
            className="btn btn-primary btn-schedule-cta"
            title="Ver Horario de Clases Semanal"
          >
            <Clock3 size={16} />
            <span>Horario</span>
          </button>

          <button 
            onClick={toggleTheme} 
            className="btn-theme" 
            title={theme === "light" ? "Activar Modo Oscuro" : "Activar Modo Claro"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <Link href="/admin" className="btn btn-secondary btn-admin-link">
            <Settings size={16} />
            <span>Administrar</span>
          </Link>
        </div>
      </header>

      {error && (
        <div className="error-banner glass-panel animate-scale">
          <AlertCircle size={24} className="error-icon" />
          <div>
            <h3>Error de Conexión</h3>
            <p>{error} Asegúrate de configurar correctamente el proyecto Firestore.</p>
          </div>
          <button onClick={fetchData} className="btn btn-secondary btn-retry">Reintentar</button>
        </div>
      )}

      {loading ? (
        <div className="app-loader">
          <Loader2 className="animate-spin text-accent" size={48} />
          <p>Cargando calendario académico...</p>
        </div>
      ) : !error && (
        <div className="app-content">
          {/* Dashboard Stats / Widgets row */}
          <div className="stats-row">
            {/* Widget 1: Next Assessment */}
            <div className="glass-panel stat-card next-eval-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Próxima Evaluación</span>
                <Clock className="stat-icon text-accent" size={18} />
              </div>
              
              {nextEvaluation ? (
                (() => {
                  const subject = subjects.find(s => s.id === nextEvaluation.subjectId);
                  const [year, month, day] = nextEvaluation.date.split("-");
                  
                  return (
                    <div className="stat-card-body" onClick={() => setSelectedEvaluation(nextEvaluation)}>
                      <div className="next-eval-meta">
                        <span 
                          className="subject-indicator"
                          style={{ backgroundColor: subject?.color }}
                        />
                        <span className="subject-name">{subject?.name}</span>
                        <span className={`type-badge ${nextEvaluation.type.toLowerCase()}`}>
                          {nextEvaluation.type}
                        </span>
                      </div>
                      <h4 className="next-eval-date">
                        {day}/{month}/{year}
                      </h4>
                      <p className="next-eval-preview">
                        {nextEvaluation.contents.length > 70 
                          ? nextEvaluation.contents.substring(0, 70) + "..." 
                          : nextEvaluation.contents}
                      </p>
                      <button className="read-more-btn">
                        Ver temario <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })()
              ) : (
                <div className="stat-card-body-empty">
                  No hay evaluaciones pendientes programadas.
                </div>
              )}
            </div>

            {/* Widget 2: Otros Eventos / Avisos */}
            <div className="glass-panel stat-card next-eval-card notifications-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Otros Eventos / Avisos</span>
                <Clock3 className="stat-icon text-accent" size={18} />
              </div>
              
              {notifications.length > 0 ? (
                (() => {
                  const latestNotif = notifications[0];
                  
                  return (
                    <div className="stat-card-body" onClick={() => setSelectedNotification(latestNotif)}>
                      <div className="next-eval-meta">
                        <span className="subject-name" style={{ color: "var(--accent-primary)" }}>{latestNotif.title}</span>
                      </div>
                      <p className="next-eval-preview font-mono" style={{ whiteSpace: "pre-line", fontSize: "0.75rem", lineHeight: "1.3", marginTop: "0.25rem", color: "var(--text-secondary)" }}>
                        {latestNotif.contents.split("\n").slice(0, 4).join("\n")}
                        {latestNotif.contents.split("\n").length > 4 ? "\n..." : ""}
                      </p>
                      <button className="read-more-btn" style={{ marginTop: "auto" }}>
                        Ver detalles <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })()
              ) : (
                <div className="stat-card-body-empty">
                  No hay notificaciones ni eventos registrados.
                </div>
              )}
            </div>

            {/* Widget 3: Resumen Académico (Unified stats) */}
            <div className="glass-panel stat-card unified-stats-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Resumen Académico</span>
                <BookOpen className="stat-icon text-accent" size={18} />
              </div>
              <div className="unified-stats-body">
                <div className="stat-item">
                  <div className="stat-item-icon bg-cyan-soft text-cyan">
                    <CalendarIcon size={18} />
                  </div>
                  <div className="stat-item-details">
                    <span className="stat-item-value">{evalsCountThisMonth}</span>
                    <span className="stat-item-label">Evaluaciones este mes</span>
                  </div>
                </div>
                <div className="stat-item-divider" />
                <div className="stat-item">
                  <div className="stat-item-icon bg-indigo-soft text-indigo">
                    <BookOpen size={18} />
                  </div>
                  <div className="stat-item-details">
                    <span className="stat-item-value">{evaluations.length}</span>
                    <span className="stat-item-label">Total programadas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Widget Container */}
          <div className="calendar-wrapper">
            {evaluations.length === 0 ? (
              <div className="glass-panel empty-database-prompt animate-scale">
                <h2>Planificador Escolar Vacío</h2>
                <p>No se encontraron datos en Firestore para desplegar el calendario.</p>
                <div className="prompt-actions">
                  <Link href="/admin" className="btn btn-primary">
                    Ir al Panel Admin para Cargar Datos de Prueba
                  </Link>
                </div>
              </div>
            ) : (
              <Calendar 
                subjects={subjects} 
                evaluations={evaluations} 
                onSelectEvaluation={(ev) => setSelectedEvaluation(ev)}
              />
            )}
          </div>
        </div>
      )}

      {/* Detail Modal overlay */}
      <EvaluationDetailModal 
        evaluation={selectedEvaluation}
        subjects={subjects}
        onClose={() => setSelectedEvaluation(null)}
      />

      {/* Schedule Modal overlay */}
      <ScheduleModal 
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />

      {/* Notification Detail Modal overlay */}
      <NotificationDetailModal 
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      <style jsx>{`
        .app-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          min-height: 100vh;
        }

        /* Header design */
        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.75rem;
          flex-wrap: wrap;
          gap: 1.25rem;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .brand-logo-wrapper {
          background: var(--accent-soft);
          color: var(--accent-primary);
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }
        .brand-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 2px;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        h1 {
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .offline-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(234, 179, 8, 0.1);
          color: #ca8a04;
          border: 1px solid rgba(234, 179, 8, 0.2);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        [data-theme="dark"] .offline-badge {
          background: rgba(234, 179, 8, 0.15);
          color: #facc15;
        }
        .brand-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .header-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .btn-theme {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .btn-theme:hover {
          background: var(--accent-soft);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        /* Loader & Error */
        .app-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          padding: 6rem 0;
          gap: 1rem;
          color: var(--text-secondary);
        }
        .error-banner {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: var(--radius-lg);
        }
        .error-icon {
          color: #ef4444;
          flex-shrink: 0;
        }
        .error-banner h3 {
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .error-banner p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .btn-retry {
          margin-left: auto;
        }

        /* App Content */
        .app-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: 1.5fr 1.5fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .stats-row {
            grid-template-columns: 1fr;
          }
        }
        
        .stat-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
        }
        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }
        .stat-card-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        /* Unified stats body layout */
        .unified-stats-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          justify-content: center;
          flex-grow: 1;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-item-icon {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-item-details {
          display: flex;
          flex-direction: column;
        }
        .stat-item-value {
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.1;
          color: var(--text-primary);
        }
        .stat-item-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .stat-item-divider {
          height: 1px;
          background: var(--border-color);
          width: 100%;
        }

        /* Next evaluation specific card */
        .next-eval-card {
          cursor: pointer;
          transition: transform var(--transition-fast), border-color var(--transition-fast);
        }
        .next-eval-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-2px);
        }
        .next-eval-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }
        .subject-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .subject-name {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .next-eval-date {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
          margin-bottom: 0.35rem;
        }
        .next-eval-preview {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        .read-more-btn {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
          padding: 0;
          margin-top: 0.75rem;
          align-self: flex-start;
        }
        .stat-card-body-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        /* Simple numeric stats cards */
        .flex-row-card {
          flex-direction: row;
          align-items: center;
          gap: 1.25rem;
        }
        .card-icon-aside {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bg-indigo-soft {
          background: rgba(79, 70, 229, 0.08);
        }
        .text-indigo {
          color: var(--accent-primary);
        }
        .bg-cyan-soft {
          background: rgba(6, 182, 212, 0.08);
        }
        .text-cyan {
          color: #06b6d4;
        }
        .card-stat-details {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.1;
          color: var(--text-primary);
        }
        .card-stat-details .stat-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        /* Empty database message */
        .empty-database-prompt {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .empty-database-prompt h2 {
          font-size: 1.75rem;
          font-weight: 800;
        }
        .empty-database-prompt p {
          color: var(--text-secondary);
          max-width: 480px;
          line-height: 1.5;
        }
        .prompt-actions {
          margin-top: 1rem;
        }

        /* Badge and meta modifiers */
        .type-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .type-badge.sumativa {
          background: rgba(124, 58, 237, 0.1);
          color: #7c3aed;
        }
        .type-badge.acumulativa {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }
        .type-badge.control {
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
        }
        .type-badge.prueba {
          background: rgba(244, 63, 94, 0.1);
          color: #f43f5e;
        }
        .type-badge.reunión, .type-badge.reunion {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        @media (max-width: 640px) {
          .header-controls {
            flex-wrap: wrap;
            justify-content: center;
          }
          .btn-schedule-cta, .btn-admin-link {
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
