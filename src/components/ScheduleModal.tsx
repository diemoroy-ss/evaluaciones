"use client";

import React, { useEffect } from "react";
import { X, Clock, Calendar as CalendarIcon, User } from "lucide-react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClassPeriod {
  name: string;
  teacher: string;
  color: string;
}

interface TimeSlot {
  time: string;
  label?: string; // e.g. "RECREO", "ALMUERZO"
  days?: {
    lunes: ClassPeriod | null;
    martes: ClassPeriod | null;
    miercoles: ClassPeriod | null;
    jueves: ClassPeriod | null;
    viernes: ClassPeriod | null;
  };
}

export default function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Subjects mapped to our theme colors
  const colors = {
    edFisica: "#ea580c", // Naranjo
    arte: "#7c3aed", // Morado / Arte in image is purple-ish
    matematica: "#2563eb", // Azul
    ingles: "#eab308", // Amarillo
    musica: "#854d0e", // Café
    orientacion: "#db2777", // Rosado / Salmon-ish
    lenguaje: "#dc2626", // Rojo
    historia: "#7c3aed", // Morado
    tecnologia: "#db2777", // Rosado / Celeste-ish
    ciencias: "#16a34a", // Verde
    religion: "#06b6d4", // Celeste
  };

  const scheduleData: TimeSlot[] = [
    {
      time: "08:15 - 09:00",
      days: {
        lunes: { name: "Educación Física", teacher: "Miss Natalia", color: colors.edFisica },
        martes: { name: "Arte", teacher: "Miss Mónica", color: colors.arte },
        miercoles: { name: "Matemática", teacher: "Miss Marisol RP", color: colors.matematica },
        jueves: { name: "Inglés Taller", teacher: "Miss Carolina", color: colors.ingles },
        viernes: { name: "Música", teacher: "Mr Asaf", color: colors.musica },
      }
    },
    {
      time: "09:00 - 09:45",
      days: {
        lunes: { name: "Educación Física", teacher: "Miss Natalia", color: colors.edFisica },
        martes: { name: "Arte", teacher: "Miss Mónica", color: colors.arte },
        miercoles: { name: "Matemática", teacher: "Miss Marisol RP", color: colors.matematica },
        jueves: { name: "Inglés Taller", teacher: "Miss Carolina", color: colors.ingles },
        viernes: { name: "Música", teacher: "Mr Asaf", color: colors.musica },
      }
    },
    {
      time: "09:45 - 10:00",
      label: "RECREO"
    },
    {
      time: "10:00 - 10:45",
      days: {
        lunes: { name: "Matemática", teacher: "Miss Marisol RP", color: colors.matematica },
        martes: { name: "Orientación", teacher: "Miss Francisca", color: colors.orientacion },
        miercoles: { name: "Lenguaje", teacher: "Miss Francisca", color: colors.lenguaje },
        jueves: { name: "Matemática", teacher: "Miss Marisol RP", color: colors.matematica },
        viernes: { name: "Historia", teacher: "Miss Francisca", color: colors.historia },
      }
    },
    {
      time: "10:45 - 11:30",
      days: {
        lunes: { name: "Matemática", teacher: "Miss Marisol RP", color: colors.matematica },
        martes: { name: "Orientación", teacher: "Miss Francisca", color: colors.orientacion },
        miercoles: { name: "Lenguaje", teacher: "Miss Francisca", color: colors.lenguaje },
        jueves: { name: "Matemática", teacher: "Miss Marisol RP", color: colors.matematica },
        viernes: { name: "Historia", teacher: "Miss Francisca", color: colors.historia },
      }
    },
    {
      time: "11:30 - 11:45",
      label: "RECREO"
    },
    {
      time: "11:45 - 12:30",
      days: {
        lunes: { name: "Tecnología", teacher: "Miss Nicole", color: colors.tecnologia },
        martes: { name: "Lenguaje", teacher: "Miss Francisca", color: colors.lenguaje },
        miercoles: { name: "Lenguaje", teacher: "Miss Francisca", color: colors.lenguaje },
        jueves: { name: "Lenguaje", teacher: "Miss Francisca", color: colors.lenguaje },
        viernes: { name: "Educación Física", teacher: "Miss Natalia", color: colors.edFisica },
      }
    },
    {
      time: "12:30 - 13:15",
      days: {
        lunes: { name: "Tecnología", teacher: "Miss Nicole", color: colors.tecnologia },
        martes: { name: "Lenguaje", teacher: "Miss Francisca", color: colors.lenguaje },
        miercoles: { name: "Lenguaje", teacher: "Miss Francisca", color: colors.lenguaje },
        jueves: { name: "Lenguaje", teacher: "Miss Francisca", color: colors.lenguaje },
        viernes: { name: "Educación Física", teacher: "Miss Natalia", color: colors.edFisica },
      }
    },
    {
      time: "13:15 - 14:00",
      label: "ALMUERZO"
    },
    {
      time: "14:00 - 14:45",
      days: {
        lunes: { name: "Ciencias Naturales", teacher: "Miss Marisol RP", color: colors.ciencias },
        martes: { name: "Religión", teacher: "Mr Juan Pablo", color: colors.religion },
        miercoles: { name: "Ciencias Naturales", teacher: "Miss Francisca", color: colors.ciencias },
        jueves: { name: "Historia", teacher: "Miss Francisca", color: colors.historia },
        viernes: null, // Salida temprana
      }
    },
    {
      time: "14:45 - 15:30",
      days: {
        lunes: { name: "Ciencias Naturales", teacher: "Miss Marisol RP", color: colors.ciencias },
        martes: { name: "Religión", teacher: "Mr Juan Pablo", color: colors.religion },
        miercoles: { name: "Ciencias Naturales", teacher: "Miss Francisca", color: colors.ciencias },
        jueves: { name: "Historia", teacher: "Miss Francisca", color: colors.historia },
        viernes: null,
      }
    }
  ];

  return (
    <div className="modal-overlay animate-fade" onClick={onClose}>
      <div className="modal-card glass-panel animate-scale" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-title-group">
            <div className="icon-wrapper">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3>Horario de Clases Semanal</h3>
              <span className="subtitle">Curso 3° Básico -- Colegio Montahue</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Body grid schedule */}
        <div className="modal-body">
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th className="time-col">Hora / Bloque</th>
                  <th>Lunes</th>
                  <th>Martes</th>
                  <th>Miércoles</th>
                  <th>Jueves</th>
                  <th>Viernes</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((row, index) => {
                  if (row.label) {
                    return (
                      <tr key={`break-${index}`} className="break-row">
                        <td className="time-cell font-mono">
                          <Clock size={12} className="inline-icon" />
                          {row.time}
                        </td>
                        <td colSpan={5} className="break-cell">
                          {row.label}
                        </td>
                      </tr>
                    );
                  }

                  const days = row.days!;
                  return (
                    <tr key={`period-${index}`}>
                      <td className="time-cell font-mono">
                        <Clock size={12} className="inline-icon" />
                        {row.time}
                      </td>
                      
                      {/* Monday */}
                      <td className="subject-cell-td">
                        {days.lunes ? (
                          <div className="subject-box" style={{ borderLeftColor: days.lunes.color, backgroundColor: `${days.lunes.color}10` }}>
                            <span className="subject-name" style={{ color: days.lunes.color }}>{days.lunes.name}</span>
                            <span className="teacher-name"><User size={10} className="inline-user" />{days.lunes.teacher}</span>
                          </div>
                        ) : (
                          <div className="empty-box">-</div>
                        )}
                      </td>

                      {/* Tuesday */}
                      <td className="subject-cell-td">
                        {days.martes ? (
                          <div className="subject-box" style={{ borderLeftColor: days.martes.color, backgroundColor: `${days.martes.color}10` }}>
                            <span className="subject-name" style={{ color: days.martes.color }}>{days.martes.name}</span>
                            <span className="teacher-name"><User size={10} className="inline-user" />{days.martes.teacher}</span>
                          </div>
                        ) : (
                          <div className="empty-box">-</div>
                        )}
                      </td>

                      {/* Wednesday */}
                      <td className="subject-cell-td">
                        {days.miercoles ? (
                          <div className="subject-box" style={{ borderLeftColor: days.miercoles.color, backgroundColor: `${days.miercoles.color}10` }}>
                            <span className="subject-name" style={{ color: days.miercoles.color }}>{days.miercoles.name}</span>
                            <span className="teacher-name"><User size={10} className="inline-user" />{days.miercoles.teacher}</span>
                          </div>
                        ) : (
                          <div className="empty-box">-</div>
                        )}
                      </td>

                      {/* Thursday */}
                      <td className="subject-cell-td">
                        {days.jueves ? (
                          <div className="subject-box" style={{ borderLeftColor: days.jueves.color, backgroundColor: `${days.jueves.color}10` }}>
                            <span className="subject-name" style={{ color: days.jueves.color }}>{days.jueves.name}</span>
                            <span className="teacher-name"><User size={10} className="inline-user" />{days.jueves.teacher}</span>
                          </div>
                        ) : (
                          <div className="empty-box">-</div>
                        )}
                      </td>

                      {/* Friday */}
                      <td className="subject-cell-td">
                        {days.viernes ? (
                          <div className="subject-box" style={{ borderLeftColor: days.viernes.color, backgroundColor: `${days.viernes.color}10` }}>
                            <span className="subject-name" style={{ color: days.viernes.color }}>{days.viernes.name}</span>
                            <span className="teacher-name"><User size={10} className="inline-user" />{days.viernes.teacher}</span>
                          </div>
                        ) : (
                          <div className="empty-box-free">Salida</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar Horario
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
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          z-index: 1000;
        }

        .modal-card {
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          padding: 1.75rem;
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-shrink: 0;
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon-wrapper {
          background: var(--accent-soft);
          color: var(--accent-primary);
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
        }

        .header-title-group h3 {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .header-title-group .subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
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
        }

        .modal-body {
          flex-grow: 1;
          overflow-y: auto;
          margin-bottom: 1rem;
          padding-right: 0.25rem;
        }

        .schedule-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          position: relative;
        }

        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
          min-width: 750px;
        }

        .schedule-table th {
          background: rgba(0, 0, 0, 0.03);
          font-weight: 700;
          color: var(--text-secondary);
          padding: 0.75rem 1rem;
          border-bottom: 2px solid var(--border-color);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.75rem;
          font-family: var(--font-secondary);
        }

        [data-theme="dark"] .schedule-table th {
          background: rgba(255, 255, 255, 0.03);
        }

        .schedule-table td {
          border-bottom: 1px solid var(--border-color);
          padding: 0.5rem;
        }

        .time-col {
          width: 130px;
        }

        .time-cell {
          font-weight: 700;
          color: var(--text-secondary);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.75rem 0.5rem !important;
        }

        .inline-icon {
          color: var(--text-muted);
        }

        .break-row {
          background: rgba(0, 0, 0, 0.015);
        }

        [data-theme="dark"] .break-row {
          background: rgba(255, 255, 255, 0.01);
        }

        .break-cell {
          text-align: center;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          font-size: 0.75rem;
          padding: 0.5rem !important;
          background: rgba(var(--accent-primary), 0.02);
        }

        .subject-cell-td {
          vertical-align: middle;
          height: 60px;
        }

        .subject-box {
          border-left: 3px solid transparent;
          padding: 0.4rem 0.625rem;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          height: 100%;
          justify-content: center;
        }

        .subject-name {
          font-weight: 700;
          font-size: 0.82rem;
          line-height: 1.2;
        }

        .teacher-name {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .inline-user {
          opacity: 0.7;
        }

        .empty-box {
          text-align: center;
          color: var(--text-muted);
          opacity: 0.5;
        }

        .empty-box-free {
          text-align: center;
          color: #16a34a;
          background: rgba(22, 163, 74, 0.08);
          border-radius: 6px;
          padding: 0.4rem;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border-color);
          padding-top: 1.25rem;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
