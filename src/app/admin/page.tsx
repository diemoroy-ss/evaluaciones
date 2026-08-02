"use client";

import React, { useState, useEffect } from "react";
import { 
  getSubjects, 
  saveSubject, 
  deleteSubject, 
  getEvaluations, 
  saveEvaluation, 
  deleteEvaluation, 
  seedDatabase,
  Subject, 
  Evaluation,
  isOfflineMode
} from "@/lib/db";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  Plus, 
  Trash2, 
  Edit, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Settings, 
  LogOut, 
  Lock, 
  Loader2, 
  Check, 
  AlertCircle,
  RefreshCw,
  WifiOff
} from "lucide-react";
import Link from "next/link";

const ADMIN_EMAIL = "santisoftai@gmail.com";

export default function AdminPage() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<"evaluations" | "subjects" | "settings">("evaluations");

  // Data State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Logo helper
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Load offline state on mount safely to avoid hydration mismatch
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    setIsOffline(isOfflineMode);
  }, []);

  // Subject Form State
  const [subjectForm, setSubjectForm] = useState<Omit<Subject, "id">>({
    name: "",
    color: "#3b82f6",
    colorName: "Azul"
  });
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // Evaluation Form State
  const [evaluationForm, setEvaluationForm] = useState<Omit<Evaluation, "id">>({
    subjectId: "",
    date: "",
    type: "Sumativa",
    contents: ""
  });
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | null>(null);

  const defaultColors = [
    { name: "Azul", hex: "#2563eb" },
    { name: "Rojo", hex: "#dc2626" },
    { name: "Verde", hex: "#16a34a" },
    { name: "Café", hex: "#854d0e" },
    { name: "Morado", hex: "#7c3aed" },
    { name: "Amarillo", hex: "#eab308" },
    { name: "Celeste", hex: "#06b6d4" },
    { name: "Naranjo", hex: "#ea580c" },
    { name: "Rosado", hex: "#db2777" },
    { name: "Gris", hex: "#4b5563" }
  ];

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(true);
      if (currentUser) {
        if (currentUser.email === ADMIN_EMAIL) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setAuthError("");
        } else {
          setAuthError(`Acceso denegado: solo el usuario ${ADMIN_EMAIL} tiene privilegios de administración.`);
          setUser(null);
          setIsAuthenticated(false);
          await signOut(auth);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedSubjects = await getSubjects();
      const fetchedEvaluations = await getEvaluations();
      setSubjects(fetchedSubjects);
      setEvaluations(fetchedEvaluations);
      
      // Select first subject by default in evaluation form
      if (fetchedSubjects.length > 0 && !evaluationForm.subjectId) {
        setEvaluationForm(prev => ({ ...prev, subjectId: fetchedSubjects[0].id }));
      }
    } catch (error) {
      showStatus("error", "Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;
      
      if (loggedUser.email === ADMIN_EMAIL) {
        setUser(loggedUser);
        setIsAuthenticated(true);
      } else {
        setAuthError(`Acceso denegado: El correo ${loggedUser.email} no es el administrador autorizado (${ADMIN_EMAIL}).`);
        setUser(null);
        setIsAuthenticated(false);
        await signOut(auth);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      // Fallback message if block/popup fails
      if (err.code === "auth/popup-blocked") {
        setAuthError("El navegador bloqueó la ventana emergente de Google. Habilítala para iniciar sesión.");
      } else {
        setAuthError("Error de conexión al autenticar con Google.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Subject CRUD Handlers
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;
    
    setOperationLoading(true);
    try {
      await saveSubject(subjectForm, editingSubjectId || undefined);
      showStatus("success", editingSubjectId ? "Asignatura actualizada." : "Asignatura creada.");
      
      // Reset form
      setSubjectForm({
        name: "",
        color: "#3b82f6",
        colorName: "Azul"
      });
      setEditingSubjectId(null);
      await fetchData();
    } catch (error) {
      showStatus("error", "Error al guardar la asignatura.");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setSubjectForm({
      name: subject.name,
      color: subject.color,
      colorName: subject.colorName
    });
    setEditingSubjectId(subject.id);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta asignatura? Se desvincularán sus evaluaciones asociadas.")) return;
    setOperationLoading(true);
    try {
      await deleteSubject(id);
      showStatus("success", "Asignatura eliminada.");
      await fetchData();
    } catch (error) {
      showStatus("error", "Error al eliminar la asignatura.");
    } finally {
      setOperationLoading(false);
    }
  };

  // Evaluation CRUD Handlers
  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluationForm.subjectId || !evaluationForm.date || !evaluationForm.contents.trim()) {
      showStatus("error", "Por favor completa todos los campos.");
      return;
    }

    setOperationLoading(true);
    try {
      await saveEvaluation(evaluationForm, editingEvaluationId || undefined);
      showStatus("success", editingEvaluationId ? "Evaluación actualizada." : "Evaluación agregada.");
      
      // Reset form
      setEvaluationForm({
        subjectId: subjects[0]?.id || "",
        date: "",
        type: "Sumativa",
        contents: ""
      });
      setEditingEvaluationId(null);
      await fetchData();
    } catch (error) {
      showStatus("error", "Error al guardar la evaluación.");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditEvaluation = (evalItem: Evaluation) => {
    setEvaluationForm({
      subjectId: evalItem.subjectId,
      date: evalItem.date,
      type: evalItem.type,
      contents: evalItem.contents
    });
    setEditingEvaluationId(evalItem.id);
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta evaluación?")) return;
    setOperationLoading(true);
    try {
      await deleteEvaluation(id);
      showStatus("success", "Evaluación eliminada.");
      await fetchData();
    } catch (error) {
      showStatus("error", "Error al eliminar la evaluación.");
    } finally {
      setOperationLoading(false);
    }
  };

  // Database Seed Handler
  const handleSeedDatabase = async () => {
    if (!confirm("Esta acción restablecerá todas las evaluaciones actuales a la versión original de las imágenes. ¿Deseas continuar?")) return;
    setOperationLoading(true);
    try {
      await seedDatabase();
      showStatus("success", "Base de datos restablecida con éxito.");
      await fetchData();
    } catch (error) {
      showStatus("error", "Error al sembrar la base de datos.");
    } finally {
      setOperationLoading(false);
    }
  };

  // Login Gate View
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="glass-panel animate-scale login-card">
          <div className="lock-icon-wrapper">
            <Lock className="lock-icon" size={32} />
          </div>
          <h1>Panel de Administración</h1>
          <p className="login-desc">Ingresa para gestionar las asignaturas y evaluaciones escolares</p>
          
          <div className="admin-restriction-banner">
            <AlertCircle size={16} />
            <span>Acceso restringido para <strong>{ADMIN_EMAIL}</strong></span>
          </div>

          {authError && (
            <div className="alert alert-error animate-slide">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            className="btn btn-google w-full" 
            disabled={authLoading}
          >
            {authLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.45-1.1 2.67-2.3 3.5v2.9h3.7c2.16-2 3.4-5 3.4-8.33z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.9l-3.7-2.9c-1.02.68-2.33 1.1-3.7 1.1-2.85 0-5.26-1.9-6.12-4.5H2.57v3c2 4 6.13 6.8 10.93 6.8z"/>
                  <path fill="#FBBC05" d="M5.88 14.8c-.22-.68-.35-1.4-.35-2.15s.13-1.47.35-2.15V7.5H2.57C1.78 9.07 1.33 10.87 1.33 12.75s.45 3.68 1.24 5.25l3.3-2.6z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.43-3.43C17.95 1.18 15.24 0 12 0 7.2 0 3.07 2.8 1.07 6.8l3.3 2.6c.86-2.6 3.27-4.5 6.12-4.5z"/>
                </svg>
                <span>Iniciar Sesión con Google</span>
              </>
            )}
          </button>
          
          <div className="login-footer">
            <Link href="/" className="btn-back">← Volver al Calendario</Link>
          </div>
        </div>

        <style jsx>{`
          .login-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1.5rem;
          }
          .login-card {
            width: 100%;
            max-width: 440px;
            padding: 3rem 2.5rem;
            text-align: center;
            box-shadow: var(--shadow-xl);
          }
          .lock-icon-wrapper {
            background: var(--accent-soft);
            color: var(--accent-primary);
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            border: 1px solid var(--border-color);
          }
          h1 {
            font-size: 1.65rem;
            margin-bottom: 0.5rem;
            font-weight: 800;
            letter-spacing: -0.01em;
          }
          .login-desc {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
            line-height: 1.45;
          }
          .admin-restriction-banner {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(79, 70, 229, 0.05);
            border: 1px solid rgba(79, 70, 229, 0.12);
            padding: 0.5rem 0.85rem;
            border-radius: var(--radius-md);
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 1.75rem;
            width: 100%;
            justify-content: center;
          }
          .alert {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.85rem 1rem;
            border-radius: var(--radius-md);
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
            text-align: left;
            line-height: 1.4;
          }
          .alert-error {
            background: rgba(239, 68, 68, 0.08);
            color: #dc2626;
            border: 1px solid rgba(239, 68, 68, 0.18);
          }
          .flex-shrink-0 {
            flex-shrink: 0;
          }
          .btn-google {
            background: #ffffff;
            color: #374151;
            border: 1.5px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 0.8rem 1.5rem;
            font-size: 0.95rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            font-weight: 700;
          }
          .btn-google:hover:not(:disabled) {
            background: #f9fafb;
            border-color: #d1d5db;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .google-icon {
            flex-shrink: 0;
          }
          .w-full {
            width: 100%;
            justify-content: center;
          }
          .login-footer {
            margin-top: 2rem;
            border-top: 1px solid var(--border-color);
            padding-top: 1.5rem;
          }
          .btn-back {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 600;
            transition: color var(--transition-fast);
          }
          .btn-back:hover {
            color: var(--accent-primary);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-layout animate-fade">
      {/* Sidebar / Top Header */}
      <header className="admin-header glass-panel">
        <div className="admin-brand">
          <div className="admin-logo-wrapper">
            <img 
              src="/logo-colegio.png" 
              alt="Logo Colegio" 
              className="admin-logo-img" 
              onLoad={() => setLogoLoaded(true)}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                setLogoLoaded(false);
              }}
              style={{ display: logoLoaded ? "block" : "none" }}
            />
            {!logoLoaded && (
              <Settings size={20} className="text-accent" />
            )}
          </div>
          <div>
            <div className="title-row">
              <h2>Dashboard Escolar</h2>
              {isOffline && (
                <span className="offline-badge">
                  <WifiOff size={10} />
                  <span>Local</span>
                </span>
              )}
            </div>
            <span className="badge-admin">Admin Mode</span>
          </div>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-link ${activeTab === "evaluations" ? "active" : ""}`}
            onClick={() => { setActiveTab("evaluations"); setStatusMessage(null); }}
          >
            <CalendarIcon size={16} />
            <span>Evaluaciones</span>
          </button>
          
          <button 
            className={`nav-link ${activeTab === "subjects" ? "active" : ""}`}
            onClick={() => { setActiveTab("subjects"); setStatusMessage(null); }}
          >
            <BookOpen size={16} />
            <span>Asignaturas</span>
          </button>

          <button 
            className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => { setActiveTab("settings"); setStatusMessage(null); }}
          >
            <RefreshCw size={16} />
            <span>Restablecer</span>
          </button>
        </nav>

        <div className="admin-actions">
          {user && (
            <div className="user-profile" title={`Conectado como ${user.email}`}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Foto de perfil" className="profile-img" />
              ) : (
                <div className="profile-initial">{user.email?.charAt(0).toUpperCase()}</div>
              )}
              <span className="user-email-label">{user.email}</span>
            </div>
          )}
          
          <Link href="/" className="btn btn-secondary mr-2">Ver Web</Link>
          <button onClick={handleLogout} className="btn btn-danger btn-icon" title="Cerrar Sesión">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="admin-main">
        {statusMessage && (
          <div className={`status-toast ${statusMessage.type} animate-slide`}>
            {statusMessage.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab content: Evaluations */}
        {activeTab === "evaluations" && (
          <div className="tab-grid">
            {/* Form Column */}
            <div className="glass-panel form-panel">
              <h3>{editingEvaluationId ? "Editar Evaluación" : "Nueva Evaluación"}</h3>
              <form onSubmit={handleEvaluationSubmit}>
                <div className="input-group">
                  <label className="input-label">Asignatura</label>
                  <select 
                    className="input-field select-field"
                    value={evaluationForm.subjectId}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, subjectId: e.target.value })}
                  >
                    <option value="" disabled>Selecciona una asignatura</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="input-group half">
                    <label className="input-label">Fecha</label>
                    <input 
                      type="date" 
                      className="input-field"
                      value={evaluationForm.date}
                      onChange={(e) => setEvaluationForm({ ...evaluationForm, date: e.target.value })}
                    />
                  </div>
                  <div className="input-group half">
                    <label className="input-label">Tipo</label>
                    <select 
                      className="input-field select-field"
                      value={evaluationForm.type}
                      onChange={(e) => setEvaluationForm({ ...evaluationForm, type: e.target.value })}
                    >
                      <option value="Sumativa">Sumativa</option>
                      <option value="Acumulativa">Acumulativa</option>
                      <option value="Control">Control</option>
                      <option value="Prueba">Prueba</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Contenidos / Temario</label>
                  <textarea 
                    className="input-field textarea-field" 
                    rows={6}
                    placeholder="Detalla los contenidos evaluados. Puedes usar viñetas (-) o saltos de línea."
                    value={evaluationForm.contents}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, contents: e.target.value })}
                  />
                </div>

                <div className="form-buttons">
                  {editingEvaluationId && (
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setEditingEvaluationId(null);
                        setEvaluationForm({
                          subjectId: subjects[0]?.id || "",
                          date: "",
                          type: "Sumativa",
                          contents: ""
                        });
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={operationLoading}>
                    {operationLoading ? <Loader2 className="animate-spin" size={16} /> : (
                      <>
                        <Plus size={16} />
                        {editingEvaluationId ? "Actualizar" : "Agregar"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="glass-panel list-panel">
              <h3>Historial de Evaluaciones ({evaluations.length})</h3>
              {loading ? (
                <div className="table-loader">
                  <Loader2 className="animate-spin text-accent" size={32} />
                  <p>Cargando evaluaciones...</p>
                </div>
              ) : evaluations.length === 0 ? (
                <div className="empty-state">
                  <p>No hay evaluaciones registradas. Crea una a la izquierda o restablece la BD en la sección superior.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Asignatura</th>
                        <th>Tipo</th>
                        <th>Contenidos</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluations.map((ev) => {
                        const subject = subjects.find(s => s.id === ev.subjectId);
                        // Format date
                        const [year, month, day] = ev.date.split("-");
                        const formattedDate = `${day}/${month}/${year}`;
                        
                        return (
                          <tr key={ev.id}>
                            <td className="font-semibold text-nowrap">{formattedDate}</td>
                            <td>
                              <span 
                                className="subject-chip"
                                style={{ 
                                  backgroundColor: `${subject?.color}15`, 
                                  color: subject?.color,
                                  borderColor: `${subject?.color}30`
                                }}
                              >
                                <span className="dot" style={{ backgroundColor: subject?.color }} />
                                {subject?.name || "Sin Asignatura"}
                              </span>
                            </td>
                            <td>
                              <span className={`type-badge ${ev.type.toLowerCase()}`}>
                                {ev.type}
                              </span>
                            </td>
                            <td className="contents-cell" title={ev.contents}>
                              {ev.contents.length > 60 ? ev.contents.substring(0, 60) + "..." : ev.contents}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button onClick={() => handleEditEvaluation(ev)} className="btn-action edit" title="Editar">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteEvaluation(ev.id)} className="btn-action delete" title="Eliminar">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content: Subjects */}
        {activeTab === "subjects" && (
          <div className="tab-grid">
            {/* Form Column */}
            <div className="glass-panel form-panel">
              <h3>{editingSubjectId ? "Editar Asignatura" : "Nueva Asignatura"}</h3>
              <form onSubmit={handleSubjectSubmit}>
                <div className="input-group">
                  <label className="input-label">Nombre de la Asignatura</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ej. Ciencias Naturales"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="input-group color-input-group">
                    <label className="input-label">Color Visual (Tag)</label>
                    <div className="color-picker-wrapper">
                      <input 
                        type="color" 
                        className="color-picker-input"
                        value={subjectForm.color}
                        onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                      />
                      <span className="color-hex-label">{subjectForm.color}</span>
                    </div>
                  </div>
                  <div className="input-group text-input-group">
                    <label className="input-label">Nombre del Color</label>
                    <input 
                      type="text" 
                      className="input-field"
                      placeholder="Ej. Verde"
                      value={subjectForm.colorName}
                      onChange={(e) => setSubjectForm({ ...subjectForm, colorName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Predefined quick colors helper */}
                <div className="quick-colors-section">
                  <label className="input-label">Colores Sugeridos</label>
                  <div className="quick-colors-grid">
                    {defaultColors.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        className="quick-color-btn"
                        style={{ backgroundColor: col.hex }}
                        title={`${col.name} (${col.hex})`}
                        onClick={() => setSubjectForm({ ...subjectForm, color: col.hex, colorName: col.name })}
                      >
                        {subjectForm.color.toLowerCase() === col.hex.toLowerCase() && (
                          <Check size={12} className="check-icon" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-buttons">
                  {editingSubjectId && (
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setEditingSubjectId(null);
                        setSubjectForm({
                          name: "",
                          color: "#3b82f6",
                          colorName: "Azul"
                        });
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={operationLoading}>
                    {operationLoading ? <Loader2 className="animate-spin" size={16} /> : (
                      <>
                        <Plus size={16} />
                        {editingSubjectId ? "Actualizar" : "Agregar"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="glass-panel list-panel">
              <h3>Asignaturas Registradas ({subjects.length})</h3>
              {loading ? (
                <div className="table-loader">
                  <Loader2 className="animate-spin text-accent" size={32} />
                  <p>Cargando asignaturas...</p>
                </div>
              ) : subjects.length === 0 ? (
                <div className="empty-state">
                  <p>No hay asignaturas registradas en el sistema escolar.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Asignatura</th>
                        <th>Color de Tag</th>
                        <th>Identificador (ID)</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((sub) => (
                        <tr key={sub.id}>
                          <td className="font-semibold">{sub.name}</td>
                          <td>
                            <span 
                              className="subject-chip"
                              style={{ 
                                backgroundColor: `${sub.color}15`, 
                                color: sub.color,
                                borderColor: `${sub.color}30`
                              }}
                            >
                              <span className="dot" style={{ backgroundColor: sub.color }} />
                              {sub.colorName} ({sub.color})
                            </span>
                          </td>
                          <td className="text-muted text-xs font-mono">{sub.id}</td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => handleEditSubject(sub)} className="btn-action edit" title="Editar">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteSubject(sub.id)} className="btn-action delete" title="Eliminar">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content: Settings */}
        {activeTab === "settings" && (
          <div className="glass-panel settings-panel">
            <h3>Configuración y Carga de Datos</h3>
            <p className="description">
              Si es la primera vez que configuras la aplicación o deseas restablecer todos los datos del calendario para que coincidan con las evaluaciones de las imágenes de ejemplo del curso, puedes presionar el botón de siembra a continuación.
            </p>
            
            <div className="warning-box">
              <AlertCircle size={20} className="text-warning" />
              <div>
                <h4>¿Qué sucederá al hacer esto?</h4>
                <p>
                  1. Se registrarán las asignaturas principales (Matemáticas, Lenguaje, Ciencias, etc.) con sus colores correspondientes.<br />
                  2. Se eliminarán todas las evaluaciones creadas previamente.<br />
                  3. Se cargarán las 15 evaluaciones correspondientes a las imágenes de Agosto y Septiembre de 2026.
                </p>
              </div>
            </div>

            <div className="action-container">
              <button 
                onClick={handleSeedDatabase} 
                className="btn btn-primary btn-large" 
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Restableciendo Base de Datos...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={20} />
                    Restablecer y Cargar Datos de Prueba
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .admin-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          gap: 1rem;
        }
        .admin-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .admin-logo-wrapper {
          background: var(--accent-soft);
          color: var(--accent-primary);
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }
        .admin-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 2px;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .admin-brand h2 {
          font-size: 1.1rem;
          font-weight: 800;
          line-height: 1.2;
        }
        .offline-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.15rem;
          background: rgba(234, 179, 8, 0.1);
          color: #ca8a04;
          border: 1px solid rgba(234, 179, 8, 0.2);
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.05rem 0.25rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .badge-admin {
          font-size: 0.65rem;
          font-weight: 700;
          background: var(--accent-soft);
          color: var(--accent-primary);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .admin-nav {
          display: flex;
          background: rgba(0, 0, 0, 0.03);
          padding: 0.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          flex-wrap: wrap;
        }
        [data-theme="dark"] .admin-nav {
          background: rgba(255, 255, 255, 0.03);
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: calc(var(--radius-md) - 2px);
          transition: all var(--transition-fast);
        }
        .nav-link:hover {
          color: var(--text-primary);
        }
        .nav-link.active {
          background: var(--bg-secondary);
          color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }
        .admin-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        /* User profile chip */
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--accent-soft);
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          border: 1px solid var(--border-color);
        }
        .profile-img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
        }
        .profile-initial {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .user-email-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 1100px) {
          .user-email-label {
            display: none;
          }
        }

        .mr-2 {
          margin-right: 0.5rem;
        }
        .admin-main {
          position: relative;
          flex-grow: 1;
        }
        
        /* Toast Notifications */
        .status-toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          font-weight: 500;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
        }
        .status-toast.success {
          background: rgba(22, 163, 74, 0.95);
          color: white;
        }
        .status-toast.error {
          background: rgba(239, 68, 68, 0.95);
          color: white;
        }

        /* Tab Grid */
        .tab-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .form-panel, .list-panel, .settings-panel {
          padding: 1.5rem;
        }
        h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .form-row {
          display: flex;
          gap: 1rem;
        }
        .half {
          flex: 1;
        }
        .select-field {
          cursor: pointer;
        }
        .textarea-field {
          resize: vertical;
        }
        .form-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        
        /* Color input */
        .color-picker-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-md);
          width: 100%;
        }
        .color-picker-input {
          -webkit-appearance: none;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          background: transparent;
        }
        .color-picker-input::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .color-picker-input::-webkit-color-swatch {
          border: 1px solid var(--border-color);
          border-radius: 6px;
        }
        .color-hex-label {
          font-family: monospace;
          font-size: 0.875rem;
          font-weight: 600;
        }

        /* Quick Colors */
        .quick-colors-section {
          margin-bottom: 1.25rem;
        }
        .quick-colors-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .quick-color-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.15);
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast);
        }
        .quick-color-btn:hover {
          transform: scale(1.15);
        }
        .check-icon {
          color: white;
          filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.5));
        }

        /* Table styles */
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }
        .admin-table th {
          background: rgba(0,0,0,0.02);
          font-weight: 600;
          color: var(--text-secondary);
          padding: 0.75rem 1rem;
          border-bottom: 2px solid var(--border-color);
        }
        [data-theme="dark"] .admin-table th {
          background: rgba(255,255,255,0.02);
        }
        .admin-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }
        .admin-table tbody tr:hover {
          background: rgba(0,0,0,0.01);
        }
        [data-theme="dark"] .admin-table tbody tr:hover {
          background: rgba(255,255,255,0.01);
        }
        .font-semibold {
          font-weight: 600;
        }
        .text-nowrap {
          white-space: nowrap;
        }
        .text-muted {
          color: var(--text-muted);
        }
        .text-xs {
          font-size: 0.75rem;
        }
        .font-mono {
          font-family: monospace;
        }
        
        /* Subject Chip badge */
        .subject-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid transparent;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Type badges */
        .type-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
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

        .contents-cell {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Action buttons */
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .btn-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .btn-action.edit:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          background: var(--accent-soft);
        }
        .btn-action.delete:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
        
        .table-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: 0.75rem;
          color: var(--text-secondary);
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
          background: rgba(0, 0, 0, 0.01);
          border-radius: var(--radius-md);
          border: 1px dashed var(--border-color);
        }

        /* Settings page */
        .settings-panel .description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        .warning-box {
          display: flex;
          gap: 1rem;
          background: rgba(234, 179, 8, 0.08);
          border: 1px solid rgba(234, 179, 8, 0.2);
          color: var(--text-primary);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
        }
        .warning-box h4 {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .warning-box p {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }
        .text-warning {
          color: #ca8a04;
          flex-shrink: 0;
        }
        .action-container {
          display: flex;
          justify-content: flex-start;
        }
        .btn-large {
          padding: 0.85rem 1.75rem;
          font-size: 1rem;
          border-radius: var(--radius-md);
        }

        /* Responsive Layout Overrides */
        @media (max-width: 992px) {
          .tab-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
          }
          
          .admin-nav {
            width: 100%;
            justify-content: space-around;
            margin: 0.5rem 0;
          }
          
          .admin-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .user-profile {
            max-width: 60%;
          }
          
          .form-panel, .list-panel, .settings-panel {
            padding: 1rem;
          }
          
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          
          .half {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
