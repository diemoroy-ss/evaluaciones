"use client";

import React, { useState, useEffect } from "react";
import { Subject, Evaluation } from "@/lib/db";
import { ChevronLeft, ChevronRight, Filter, Calendar as CalendarIcon, List, Eye } from "lucide-react";

interface CalendarProps {
  subjects: Subject[];
  evaluations: Evaluation[];
  onSelectEvaluation: (evaluation: Evaluation) => void;
}

export default function Calendar({ subjects, evaluations, onSelectEvaluation }: CalendarProps) {
  // Date Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Filtering State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Selected Day for Mobile View
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Smart Initial Date setting (open on the month of the first evaluation)
  useEffect(() => {
    if (evaluations.length > 0) {
      // Find the earliest evaluation
      const sorted = [...evaluations].sort((a, b) => a.date.localeCompare(b.date));
      // Set current date to that evaluation's month
      const firstEvalDate = new Date(sorted[0].date + "T12:00:00");
      setCurrentDate(firstEvalDate);
      setSelectedDay(firstEvalDate);
    } else {
      setSelectedDay(new Date());
    }
  }, [evaluations]);

  // Calendar Logic Constants
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // 0 = Sunday, 1 = Monday, etc. Adjust so 0 = Monday, 6 = Sunday
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Filter Evaluations
  const filteredEvaluations = evaluations.filter((ev) => {
    const matchSubject = selectedSubjectId === "all" || ev.subjectId === selectedSubjectId;
    const matchType = selectedType === "all" || ev.type === selectedType;
    return matchSubject && matchType;
  });

  // Check if a day is today
  const isToday = (dayNum: number) => {
    const today = new Date();
    return (
      today.getDate() === dayNum &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  // Check if a day is selected
  const isSelected = (dayNum: number) => {
    return (
      selectedDay !== null &&
      selectedDay.getDate() === dayNum &&
      selectedDay.getMonth() === currentDate.getMonth() &&
      selectedDay.getFullYear() === currentDate.getFullYear()
    );
  };

  // Get evaluations for a specific day
  const getEvaluationsForDay = (dayNum: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    return filteredEvaluations.filter((ev) => ev.date === dateStr);
  };

  // Generate calendar cells
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  
  const cells: { type: "empty" | "day"; val: number }[] = [];
  
  // Previous month filler
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ type: "empty", val: i });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ type: "day", val: i });
  }

  // Selected day evaluations for mobile view
  const selectedDayEvals = selectedDay 
    ? filteredEvaluations.filter((ev) => {
        const d = new Date(ev.date + "T12:00:00");
        return (
          d.getDate() === selectedDay.getDate() &&
          d.getMonth() === selectedDay.getMonth() &&
          d.getFullYear() === selectedDay.getFullYear()
        );
      })
    : [];

  return (
    <div className="calendar-component animate-fade">
      {/* Filters and Header Control */}
      <div className="calendar-controls glass-panel">
        <div className="filter-section">
          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <span className="filter-title">Filtrar:</span>
          </div>
          
          <select 
            className="filter-select"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <option value="all">Todas las Asignaturas</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Todos los Tipos</option>
            <option value="Sumativa">Sumativas</option>
            <option value="Acumulativa">Acumulativas</option>
            <option value="Control">Controles</option>
            <option value="Prueba">Pruebas</option>
          </select>
        </div>

        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
            onClick={() => setViewMode("calendar")}
            title="Vista de Calendario"
          >
            <CalendarIcon size={16} />
            <span>Calendario</span>
          </button>
          <button 
            className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="Vista de Lista"
          >
            <List size={16} />
            <span>Lista</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Interface */}
      {viewMode === "calendar" ? (
        <div className="calendar-main-grid">
          {/* Month Navigation Header */}
          <div className="calendar-header glass-panel">
            <button className="nav-arrow" onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="current-month-label">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className="nav-arrow" onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid wrapper */}
          <div className="grid-wrapper glass-panel">
            {/* Days of Week Header */}
            <div className="day-names-row">
              {dayNames.map((name) => (
                <div key={name} className="day-name-cell">
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="days-grid">
              {cells.map((cell, idx) => {
                if (cell.type === "empty") {
                  return <div key={`empty-${idx}`} className="day-cell empty" />;
                }

                const dayNum = cell.val;
                const dayEvals = getEvaluationsForDay(dayNum);
                const dayHasEvals = dayEvals.length > 0;
                
                return (
                  <div 
                    key={`day-${dayNum}`} 
                    className={`day-cell ${isToday(dayNum) ? "today" : ""} ${isSelected(dayNum) ? "selected" : ""} ${dayHasEvals ? "has-evals" : ""}`}
                    onClick={() => setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum))}
                  >
                    <div className="day-number-wrapper">
                      <span className="day-number">{dayNum}</span>
                    </div>

                    {/* Desktop Evaluations List */}
                    <div className="cell-evals-list">
                      {dayEvals.slice(0, 3).map((ev) => {
                        const subject = subjects.find(s => s.id === ev.subjectId);
                        return (
                          <div 
                            key={ev.id} 
                            className="cell-eval-card"
                            style={{ 
                              borderLeftColor: subject?.color || "#94a3b8",
                              backgroundColor: `${subject?.color || "#94a3b8"}15`,
                              color: subject?.color || "inherit"
                            }}
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid triggering day select
                              onSelectEvaluation(ev);
                            }}
                          >
                            <span className="eval-sub-name">{subject?.name || "Asignatura"}</span>
                            <span className="eval-sub-type">{ev.type}</span>
                          </div>
                        );
                      })}
                      {dayEvals.length > 3 && (
                        <div className="more-evals-indicator">
                          +{dayEvals.length - 3} más
                        </div>
                      )}
                    </div>

                    {/* Mobile Indicators */}
                    <div className="cell-evals-dots">
                      {dayEvals.map((ev) => {
                        const subject = subjects.find(s => s.id === ev.subjectId);
                        return (
                          <span 
                            key={ev.id} 
                            className="mobile-dot"
                            style={{ backgroundColor: subject?.color || "#94a3b8" }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Selected Day Detail Panel */}
          {selectedDay && (
            <div className="mobile-detail-panel glass-panel animate-slide">
              <div className="panel-header">
                <h4>
                  Evaluaciones del {selectedDay.getDate()} de {months[selectedDay.getMonth()]}
                </h4>
                <span className="evals-count-badge">
                  {selectedDayEvals.length} {selectedDayEvals.length === 1 ? "evaluación" : "evaluaciones"}
                </span>
              </div>

              {selectedDayEvals.length === 0 ? (
                <div className="panel-empty-state">
                  No hay evaluaciones programadas para este día.
                </div>
              ) : (
                <div className="panel-evals-list">
                  {selectedDayEvals.map((ev) => {
                    const subject = subjects.find(s => s.id === ev.subjectId);
                    return (
                      <div 
                        key={ev.id} 
                        className="mobile-eval-card"
                        style={{ borderLeftColor: subject?.color || "#94a3b8" }}
                        onClick={() => onSelectEvaluation(ev)}
                      >
                        <div className="mobile-card-meta">
                          <span className="subject-name" style={{ color: subject?.color }}>
                            {subject?.name}
                          </span>
                          <span className={`type-badge ${ev.type.toLowerCase()}`}>
                            {ev.type}
                          </span>
                        </div>
                        <p className="mobile-card-preview">
                          {ev.contents.length > 80 ? ev.contents.substring(0, 80) + "..." : ev.contents}
                        </p>
                        <button className="mobile-card-action">
                          <Eye size={14} /> Ver contenidos
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* List Mode view (Alternative agenda) */
        <div className="agenda-list-view glass-panel">
          <h3>Próximas Evaluaciones ({filteredEvaluations.length})</h3>
          {filteredEvaluations.length === 0 ? (
            <div className="agenda-empty">
              No hay evaluaciones que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="agenda-list">
              {filteredEvaluations.map((ev) => {
                const subject = subjects.find(s => s.id === ev.subjectId);
                const [year, month, day] = ev.date.split("-");
                const dateObj = new Date(ev.date + "T12:00:00");
                const formattedDate = `${day} de ${months[dateObj.getMonth()]}, ${year}`;
                
                return (
                  <div 
                    key={ev.id} 
                    className="agenda-item"
                    style={{ borderLeftColor: subject?.color || "#94a3b8" }}
                    onClick={() => onSelectEvaluation(ev)}
                  >
                    <div className="agenda-date-box">
                      <span className="agenda-date-day">{day}</span>
                      <span className="agenda-date-month">{months[dateObj.getMonth()].substring(0, 3)}</span>
                    </div>

                    <div className="agenda-content">
                      <div className="agenda-meta">
                        <span className="agenda-subject" style={{ color: subject?.color }}>
                          {subject?.name}
                        </span>
                        <span className={`type-badge ${ev.type.toLowerCase()}`}>
                          {ev.type}
                        </span>
                        <span className="agenda-date-full">
                          {formattedDate}
                        </span>
                      </div>
                      <p className="agenda-snippet">
                        {ev.contents.split("\n")[0]}
                      </p>
                    </div>

                    <button className="agenda-view-btn">
                      Detalles
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Colors Legend footer */}
      <div className="subjects-legend glass-panel">
        <h4>Leyenda de Asignaturas</h4>
        <div className="legend-items">
          {subjects.map((sub) => (
            <div 
              key={sub.id} 
              className="legend-item-chip"
              style={{ 
                backgroundColor: `${sub.color}10`,
                borderColor: `${sub.color}25`,
                color: sub.color
              }}
            >
              <span className="legend-dot" style={{ backgroundColor: sub.color }} />
              <span>{sub.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .calendar-component {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }

        /* Controls styling */
        .calendar-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .filter-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .filter-icon {
          color: var(--accent-primary);
        }
        .filter-select {
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-family: var(--font-primary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .filter-select:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        /* Toggle view buttons */
        .view-toggle {
          display: flex;
          background: rgba(0, 0, 0, 0.03);
          padding: 0.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }
        [data-theme="dark"] .view-toggle {
          background: rgba(255, 255, 255, 0.03);
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.4rem 0.85rem;
          border-radius: calc(var(--radius-md) - 2px);
          font-size: 0.85rem;
          font-weight: 600;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .toggle-btn.active {
          background: var(--bg-secondary);
          color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }

        /* Month Navigation */
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
        }
        .nav-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .nav-arrow:hover {
          background: var(--accent-soft);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }
        .current-month-label {
          font-size: 1.35rem;
          font-weight: 800;
          text-transform: capitalize;
          letter-spacing: -0.02em;
        }

        /* Grid Wrapper & Structure */
        .grid-wrapper {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .day-names-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
        }
        .day-name-cell {
          font-family: var(--font-secondary);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.5rem 0;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: minmax(110px, 1fr);
          gap: 0.5rem;
        }

        /* Day Cells */
        .day-cell {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-fast);
          cursor: pointer;
          position: relative;
          min-height: 110px;
        }
        [data-theme="dark"] .day-cell {
          background: rgba(255, 255, 255, 0.01);
        }
        .day-cell:hover {
          border-color: var(--text-muted);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .day-cell.empty {
          background: transparent;
          border: none;
          cursor: default;
          pointer-events: none;
        }
        .day-cell.today {
          background: rgba(79, 70, 229, 0.03);
          border-color: rgba(79, 70, 229, 0.3);
        }
        .day-cell.today .day-number {
          background: var(--accent-primary);
          color: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        .day-cell.selected {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--accent-soft);
        }

        .day-number-wrapper {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 0.5rem;
        }
        .day-number {
          font-weight: 700;
          font-size: 0.95rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        .day-cell.today .day-number {
          color: white;
        }

        /* Desktop Evaluation Cards inside grid */
        .cell-evals-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex-grow: 1;
        }
        @media (max-width: 768px) {
          .cell-evals-list {
            display: none; /* Hide cards on mobile, show dots */
          }
        }
        .cell-eval-card {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.4rem;
          border-radius: 4px;
          border-left: 3px solid transparent;
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          transition: transform var(--transition-fast);
        }
        .cell-eval-card:hover {
          transform: scale(1.03);
        }
        .eval-sub-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .eval-sub-type {
          font-size: 0.6rem;
          opacity: 0.75;
          text-transform: uppercase;
        }
        .more-evals-indicator {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-align: right;
          font-weight: 600;
          margin-top: auto;
        }

        /* Mobile Dots */
        .cell-evals-dots {
          display: none;
          justify-content: center;
          gap: 0.2rem;
          margin-top: auto;
        }
        @media (max-width: 768px) {
          .cell-evals-dots {
            display: flex;
          }
          .days-grid {
            grid-auto-rows: 60px;
            min-height: auto;
          }
          .day-cell {
            min-height: 60px;
            justify-content: space-between;
            align-items: center;
            padding: 0.25rem;
          }
          .day-number-wrapper {
            margin-bottom: 0;
          }
        }
        .mobile-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        /* Mobile Details Panel below calendar */
        .mobile-detail-panel {
          display: none;
          padding: 1.25rem;
          flex-direction: column;
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .mobile-detail-panel {
            display: flex;
          }
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }
        .panel-header h4 {
          font-size: 1rem;
          font-weight: 700;
        }
        .evals-count-badge {
          font-size: 0.75rem;
          background: var(--accent-soft);
          color: var(--accent-primary);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .panel-empty-state {
          text-align: center;
          padding: 1.5rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .panel-evals-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mobile-eval-card {
          padding: 1rem;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-left: 4px solid transparent;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          cursor: pointer;
        }
        .mobile-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mobile-card-meta .subject-name {
          font-weight: 700;
          font-size: 0.9rem;
        }
        .mobile-card-preview {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .mobile-card-action {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0;
        }

        /* Type Badges */
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

        /* Agenda / List Mode View */
        .agenda-list-view {
          padding: 1.5rem;
        }
        .agenda-list-view h3 {
          font-size: 1.2rem;
          margin-bottom: 1.25rem;
          font-weight: 700;
        }
        .agenda-empty {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
        }
        .agenda-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .agenda-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-left: 4px solid transparent;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          gap: 1.25rem;
        }
        .agenda-item:hover {
          transform: translateX(4px);
          border-color: var(--text-muted);
        }
        .agenda-date-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          width: 50px;
          height: 50px;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .agenda-date-day {
          font-weight: 800;
          font-size: 1.15rem;
          line-height: 1;
        }
        .agenda-date-month {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .agenda-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }
        .agenda-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .agenda-subject {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .agenda-date-full {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .agenda-snippet {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .agenda-view-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .agenda-item:hover .agenda-view-btn {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: var(--accent-soft);
        }

        /* Subjects Legend Footer */
        .subjects-legend {
          padding: 1.25rem;
        }
        .subjects-legend h4 {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
        }
        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .legend-item-chip {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid transparent;
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
