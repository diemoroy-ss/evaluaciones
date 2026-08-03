"use client";

import React, { useEffect } from "react";
import { X, HelpCircle, CalendarDays, Clock, FileDown, Info } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
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

  return (
    <div className="modal-overlay animate-fade">
      <div className="modal-card animate-scale">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <HelpCircle size={24} className="text-accent" />
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>¿Cómo usar esta plataforma?</h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar ayuda">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="help-intro">
            Bienvenido al panel escolar de <strong>3° Básico</strong>. Esta herramienta está diseñada para que los apoderados puedan revisar rápidamente qué evaluaciones y actividades tienen los estudiantes.
          </p>

          <div className="help-sections">
            <div className="help-section">
              <div className="help-icon-box">
                <Clock size={20} className="text-accent" />
              </div>
              <div className="help-content">
                <h3>Próxima Evaluación y Avisos</h3>
                <p>En la parte superior encontrarás un resumen rápido con la <strong>evaluación más próxima</strong> y los <strong>avisos o actividades recientes</strong> (como materiales o eventos). ¡Es lo primero que debes revisar!</p>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon-box">
                <CalendarDays size={20} className="text-accent" />
              </div>
              <div className="help-content">
                <h3>El Calendario</h3>
                <p>El calendario mensual marca los días que tienen eventos.</p>
                <ul>
                  <li>En el <strong>celular</strong>: verás puntitos de colores debajo de los días. <strong>Toca el número del día</strong> para ver el detalle en la lista que aparece debajo del calendario.</li>
                  <li>En el <strong>computador</strong>: verás pequeñas tarjetas directamente sobre el calendario.</li>
                  <li>Puedes usar los selectores de arriba para filtrar por <strong>Asignatura</strong> o ver solo <strong>Actividades</strong>.</li>
                </ul>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon-box">
                <FileDown size={20} className="text-accent" />
              </div>
              <div className="help-content">
                <h3>Archivos Adjuntos (Guías/Rúbricas)</h3>
                <p>Si ves el ícono de un <strong>clip (📎)</strong> al lado de un evento, significa que el profesor adjuntó un archivo. Haz clic en <em>"Ver temario/contenidos"</em> del evento y encontrarás un botón azul de descarga.</p>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon-box">
                <Info size={20} className="text-accent" />
              </div>
              <div className="help-content">
                <h3>Horario de Clases</h3>
                <p>Usa el botón de <strong>Horario</strong> (arriba, junto al título) para ver las clases que corresponden a cada día de la semana y sus respectivos profesores.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Entendido, ¡gracias!
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
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
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
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .flex {
          display: flex;
        }
        .items-center {
          align-items: center;
        }
        .gap-2 {
          gap: 0.5rem;
        }
        .text-accent {
          color: var(--accent-primary);
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 50%;
          transition: background var(--transition-fast);
        }
        .btn-close:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          -webkit-overflow-scrolling: touch;
        }

        .help-intro {
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          background: var(--bg-hover);
          padding: 1rem;
          border-radius: var(--radius-md);
          border-left: 4px solid var(--accent-primary);
        }

        .help-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .help-section {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .help-icon-box {
          background: rgba(var(--accent-primary-rgb, 79, 70, 229), 0.1);
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .help-content h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .help-content p {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin: 0;
        }

        .help-content ul {
          margin-top: 0.5rem;
          padding-left: 1.25rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .help-content li {
          margin-bottom: 0.25rem;
        }

        .modal-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
          background: var(--bg-primary);
        }
      `}</style>
    </div>
  );
}
