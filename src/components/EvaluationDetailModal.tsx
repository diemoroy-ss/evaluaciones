"use client";

import React, { useEffect } from "react";
import { Evaluation, Subject } from "@/lib/db";
import { X, Calendar as CalendarIcon, BookOpen, Layers, Download } from "lucide-react";

interface EvaluationDetailModalProps {
  evaluation: Evaluation | null;
  subjects: Subject[];
  onClose: () => void;
}

export default function EvaluationDetailModal({ evaluation, subjects, onClose }: EvaluationDetailModalProps) {
  // Lock scroll when open
  useEffect(() => {
    if (evaluation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [evaluation]);

  if (!evaluation) return null;

  const subject = subjects.find((s) => s.id === evaluation.subjectId);
  const color = subject?.color || "#4f46e5";

  // Date formatting
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const dateObj = new Date(evaluation.date + "T12:00:00");
  const formattedDayOfWeek = daysOfWeek[dateObj.getDay()];
  const formattedDay = dateObj.getDate();
  const formattedMonth = months[dateObj.getMonth()];
  const formattedYear = dateObj.getFullYear();
  const fullDateString = `${formattedDayOfWeek} ${formattedDay} de ${formattedMonth}, ${formattedYear}`;

  // Content parser: render lines starting with '-' or '*' as list items, others as text blocks
  const renderContents = (text: string) => {
    const lines = text.split("\n");
    let currentList: React.ReactNode[] = [];
    const elements: React.ReactNode[] = [];

    const flushList = (key: number) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="contents-list">
            {currentList}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        // Strip the bullet indicator
        const content = trimmed.substring(1).trim();
        currentList.push(
          <li key={`li-${index}`} className="list-item">
            <span className="list-bullet" style={{ backgroundColor: color }} />
            <span>{content}</span>
          </li>
        );
      } else {
        flushList(index);
        if (trimmed) {
          // If it's a bold header in contents (e.g. "Evaluación final U.2" or "Control")
          const isHeader = trimmed.toLowerCase().includes("evaluación") || 
                           trimmed.toLowerCase().includes("control") || 
                           trimmed.toLowerCase().includes("prueba") ||
                           trimmed.endsWith(":") ||
                           trimmed.length < 35;
          
          elements.push(
            <p 
              key={`p-${index}`} 
              className={isHeader ? "contents-paragraph-header" : "contents-paragraph"}
            >
              {trimmed}
            </p>
          );
        }
      }
    });

    flushList(lines.length);
    return elements;
  };

  return (
    <div className="modal-overlay animate-fade" onClick={onClose}>
      <div 
        className="modal-card animate-scale" 
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `6px solid ${color}` }}
      >
        {/* Header section */}
        <div className="modal-header">
          <span 
            className="modal-subject-badge"
            style={{ 
              backgroundColor: `${color}12`, 
              color: color,
              borderColor: `${color}35`
            }}
          >
            <BookOpen size={14} />
            {subject?.name || "Asignatura"}
          </span>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Body section */}
        <div className="modal-body">
          <div className="metadata-row">
            <div className="meta-item">
              <CalendarIcon size={18} className="meta-icon" style={{ color: color }} />
              <div>
                <span className="meta-label">Fecha de Evaluación</span>
                <span className="meta-value">{fullDateString}</span>
              </div>
            </div>
            
            <div className="meta-item">
              <Layers size={18} className="meta-icon" style={{ color: color }} />
              <div>
                <span className="meta-label">Tipo de Evaluación</span>
                <div>
                  <span className={`type-badge ${evaluation.type.toLowerCase()}`}>
                    {evaluation.type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="contents-section">
            <h4 className="section-title">Temas y Contenidos a Evaluar</h4>
            <div className="contents-box">
              {renderContents(evaluation.contents)}
            </div>
          </div>

          {evaluation.fileUrl && (
            <div className="contents-section" style={{ marginTop: "1rem" }}>
              <h4 className="section-title">Archivo Adjunto</h4>
              <a 
                href={evaluation.fileUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="file-download-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--bg-glass-lighter)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  transition: "all 0.2s ease"
                }}
              >
                <Download size={18} style={{ color: color }} />
                <span>{evaluation.fileName || "Descargar Archivo"}</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer section */}
        <div className="modal-footer">
          <button 
            className="btn btn-understand" 
            onClick={onClose}
            style={{ 
              backgroundColor: color,
              boxShadow: `0 4px 14px 0 ${color}45`
            }}
          >
            Entendido
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.7); /* Darker backdrop for higher contrast overlay */
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          z-index: 1000;
        }

        .modal-card {
          width: 100%;
          max-width: 580px;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          border-radius: var(--radius-lg);
          background: var(--bg-secondary); /* Solid background (pure white in light, dark grey in dark) */
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-subject-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.95rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1.5px solid;
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .close-btn:hover {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-color: var(--text-muted);
          transform: scale(1.05);
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Metadata */
        .metadata-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1.5rem;
        }
        @media (max-width: 480px) {
          .metadata-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        
        .meta-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }
        .meta-icon {
          margin-top: 0.15rem;
          flex-shrink: 0;
        }
        .meta-label {
          display: block;
          font-family: var(--font-secondary);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary); /* Darker text for label contrast */
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .meta-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
        }

        /* Type Badges */
        .type-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          text-transform: uppercase;
          margin-top: 0.15rem;
        }
        .type-badge.sumativa {
          background: rgba(124, 58, 237, 0.12);
          color: #6d28d9;
          border: 1px solid rgba(124, 58, 237, 0.2);
        }
        [data-theme="dark"] .type-badge.sumativa {
          background: rgba(167, 139, 250, 0.15);
          color: #c084fc;
        }
        .type-badge.acumulativa {
          background: rgba(37, 99, 235, 0.12);
          color: #1d4ed8;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }
        [data-theme="dark"] .type-badge.acumulativa {
          background: rgba(96, 165, 250, 0.15);
          color: #93c5fd;
        }
        .type-badge.control {
          background: rgba(8, 145, 178, 0.12);
          color: #0e7490;
          border: 1px solid rgba(8, 145, 178, 0.2);
        }
        [data-theme="dark"] .type-badge.control {
          background: rgba(34, 211, 238, 0.15);
          color: #67e8f9;
        }
        .type-badge.prueba {
          background: rgba(220, 38, 38, 0.12);
          color: #b91c1c;
          border: 1px solid rgba(220, 38, 38, 0.2);
        }
        [data-theme="dark"] .type-badge.prueba {
          background: rgba(248, 113, 113, 0.15);
          color: #fca5a5;
        }
        .type-badge.reunión, .type-badge.reunion {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        [data-theme="dark"] .type-badge.reunión, [data-theme="dark"] .type-badge.reunion {
          background: rgba(52, 211, 153, 0.15);
          color: #6ee7b7;
        }

        /* Contents Section */
        .section-title {
          font-family: var(--font-secondary);
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .contents-box {
          background: var(--bg-primary); /* Uses a light-grey fallback background for offset contrast */
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          max-height: 280px;
          overflow-y: auto;
        }

        .contents-paragraph-header {
          font-weight: 800;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .contents-paragraph {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }

        .contents-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-bottom: 0.75rem;
          padding-left: 0.25rem;
        }

        .list-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: var(--text-primary); /* Darker and higher contrast text color */
          line-height: 1.5;
        }

        .list-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 0.45rem;
          flex-shrink: 0;
          box-shadow: 0 0 6px currentColor;
        }

        .modal-footer {
          margin-top: 1.75rem;
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
        }

        .btn-understand {
          font-family: var(--font-secondary);
          font-weight: 700;
          padding: 0.75rem 1.75rem;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          color: #ffffff;
          font-size: 0.9rem;
          transition: all var(--transition-fast);
        }

        .btn-understand:hover {
          filter: brightness(0.92);
          transform: translateY(-1px);
        }

        .btn-understand:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
