"use client";

import React, { useEffect } from "react";
import { X, Clock3 } from "lucide-react";
import { EventNotification } from "@/lib/db";

interface NotificationDetailModalProps {
  notification: EventNotification | null;
  onClose: () => void;
}

export default function NotificationDetailModal({ notification, onClose }: NotificationDetailModalProps) {
  // Lock scroll when open
  useEffect(() => {
    if (notification) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [notification]);

  if (!notification) return null;

  return (
    <div className="modal-overlay animate-fade" onClick={onClose}>
      <div className="modal-card glass-panel animate-scale" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-title-group">
            <div className="icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <Clock3 size={20} />
            </div>
            <div>
              <h3>{notification.title}</h3>
              <span className="subtitle">Otros Eventos / Avisos</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="notification-content-box">
            {notification.contents}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
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
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-title-group h3 {
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .header-title-group .subtitle {
          font-size: 0.7rem;
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
        }

        .notification-content-box {
          white-space: pre-line;
          font-size: 0.92rem;
          line-height: 1.6;
          font-family: monospace;
          background: var(--bg-primary);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
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
