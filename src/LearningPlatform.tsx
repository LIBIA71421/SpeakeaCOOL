import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Clipboard,
  Eye,
  FileText,
  FolderOpen,
  LogOut,
  MessageCircle,
  MonitorUp,
  Send,
  Square,
  Upload,
  Video,
  Volume2,
} from "lucide-react";
import { SpeechService, StudyAssistantClient } from "./assistant";
import {
  getAccountProfile,
  downloadAccountFile,
  deleteLearningContent,
  listLearningContent,
  listStoredFiles,
  listStudentAccounts,
  registerStudent,
  removeAccountFile,
  signInStudent,
  signOutAccount,
  subscribeToAuth,
  saveLearningContent,
  uploadAccountFile,
  type AccountProfile,
  type LearningContent,
  type StoredFile,
  type StudentAccount,
} from "./firebase";

type Props = { onExit: () => void };
type Section = "home" | "materials" | "room" | "library" | "assistant";

const assistantEndpoint =
  (import.meta.env.VITE_STUDY_ASSISTANT_URL as string | undefined) ||
  "https://speakeacool-study-assistant.speakeacool.workers.dev";
const allowedFileTypes = ".pdf,.docx,.txt,.png,.jpg,.jpeg";
const speechService = new SpeechService();

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado. Inténtalo otra vez.";
}

function LearningPlatform({ onExit }: Props) {
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [section, setSection] = useState<Section>("home");
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    try {
      return subscribeToAuth((nextUser) => {
        setUser(nextUser);
        setAuthError("");
        if (!nextUser) {
          setProfile(null);
          setAuthLoading(false);
          return;
        }

        setProfileLoading(true);
        void getAccountProfile(nextUser)
          .then(setProfile)
          .catch((error: unknown) => setAuthError(getErrorMessage(error)))
          .finally(() => {
            setProfileLoading(false);
            setAuthLoading(false);
          });
      });
    } catch (error) {
      setAuthError(getErrorMessage(error));
      setAuthLoading(false);
      return undefined;
    }
  }, []);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="portal-loading">
        <span className="brutal-mark">S!</span>
        <p>ABRIENDO EL AULA…</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <AuthScreen
        error={authError}
        onExit={onExit}
        onAuthenticated={setUser}
      />
    );
  }

  return (
    <PortalDashboard
      user={user}
      profile={profile}
      section={section}
      onSectionChange={setSection}
      onExit={onExit}
      onSignedOut={() => {
        setProfile(null);
        setUser(null);
        setSection("home");
      }}
    />
  );
}

function AuthScreen({
  error,
  onExit,
  onAuthenticated,
}: {
  error: string;
  onExit: () => void;
  onAuthenticated: (user: import("firebase/auth").User) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(error);

  useEffect(() => setFeedback(error), [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const user =
        mode === "register"
          ? await registerStudent(name.trim(), email.trim().toLowerCase(), password)
          : await signInStudent(email.trim().toLowerCase(), password);
      onAuthenticated(user);
    } catch (submitError) {
      setFeedback(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="portal-topbar">
        <a className="brutal-brand" href="#inicio"><span>S!</span> SPEAKEACOOL</a>
        <button className="brutal-button button-light" onClick={onExit} type="button">
          <ArrowLeft size={16} /> VOLVER AL SITIO
        </button>
      </div>
      <section className="auth-card">
        <div className="auth-stamp">AULA DIGITAL · COCHABAMBA</div>
        <h1>{mode === "register" ? <>TU AULA.<br /><span>TU RITMO.</span></> : <>ENTRA A<br /><span>APRENDER.</span></>}</h1>
        <p className="auth-lede">Materiales, sala de clase y tus documentos en un mismo lugar.</p>
        <form onSubmit={submit} className="brutal-form">
          {mode === "register" && (
            <label>
              <span>NOMBRE</span>
              <input
                autoComplete="name"
                maxLength={80}
                minLength={2}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
                required
                value={name}
              />
            </label>
          )}
          <label>
            <span>CORREO ELECTRÓNICO</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            <span>CONTRASEÑA</span>
            <input
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={mode === "register" ? 6 : undefined}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              type="password"
              value={password}
            />
          </label>
          {feedback && <p className="portal-feedback error" role="alert">{feedback}</p>}
          <button className="brutal-button button-acid auth-submit" disabled={busy} type="submit">
            {busy ? "UN MOMENTO…" : mode === "register" ? "CREAR CUENTA" : "INICIAR SESIÓN"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        <button
          className="auth-toggle"
          onClick={() => {
            setMode((current) => current === "login" ? "register" : "login");
            setFeedback("");
          }}
          type="button"
        >
          {mode === "register" ? "¿Ya tienes cuenta? Entra aquí." : "¿Primera vez? Crea tu cuenta de estudiante."}
        </button>
        <p className="auth-footnote">EL ACCESO DE TUTOR SE HABILITA DESDE FIREBASE.</p>
      </section>
    </main>
  );
}

function PortalDashboard({
  user,
  profile,
  section,
  onSectionChange,
  onExit,
  onSignedOut,
}: {
  user: import("firebase/auth").User;
  profile: AccountProfile;
  section: Section;
  onSectionChange: (section: Section) => void;
  onExit: () => void;
  onSignedOut: () => void;
}) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourceError, setResourceError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomActive, setRoomActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerSources, setAnswerSources] = useState<string[]>([]);
  const [assistantError, setAssistantError] = useState("");
  const [asking, setAsking] = useState(false);
  const [preview, setPreview] = useState<{ file: StoredFile; blob: Blob } | null>(null);

  async function refreshResources() {
    setResourcesLoading(true);
    setResourceError("");
    try {
      const [nextFiles, nextStudents, nextContent] = await Promise.all([
        listStoredFiles(profile),
        profile.role === "owner" ? listStudentAccounts() : Promise.resolve([]),
        listLearningContent(profile),
      ]);
      setFiles(nextFiles);
      setStudents(nextStudents);
      setLearningContent(nextContent);
    } catch (error) {
      setResourceError(getErrorMessage(error));
    } finally {
      setResourcesLoading(false);
    }
  }

  useEffect(() => {
    void refreshResources();
  }, [profile.uid, profile.role]);

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setUploadMessage("Elige un archivo antes de subirlo.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadMessage("El archivo supera el límite de 20 MB.");
      return;
    }
    setUploading(true);
    setUploadMessage("");
    try {
      await uploadAccountFile(file, profile.uid, user.uid);
      formElement.reset();
      await refreshResources();
      setUploadMessage("ARCHIVO GUARDADO EN EL ALMACÉN.");
    } catch (error) {
      setUploadMessage(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(file: StoredFile) {
    setResourceError("");
    try {
      await removeAccountFile(file);
      await refreshResources();
    } catch (error) {
      setResourceError(getErrorMessage(error));
    }
  }

  async function previewFile(file: StoredFile) {
    setResourceError("");
    try {
      setPreview({ file, blob: await downloadAccountFile(file) });
    } catch (error) {
      setResourceError(getErrorMessage(error));
    }
  }

  async function saveContent(content: Omit<LearningContent, "id" | "ownerUid">, id?: string) {
    try {
      await saveLearningContent(profile, content, id);
      await refreshResources();
    } catch (error) {
      setResourceError(getErrorMessage(error));
      throw error;
    }
  }

  async function deleteContent(content: LearningContent) {
    if (!window.confirm(`¿Eliminar "${content.title}"?`)) return;
    try {
      await deleteLearningContent(profile, content.id);
      await refreshResources();
    } catch (error) {
      setResourceError(getErrorMessage(error));
    }
  }

  async function askAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assistantEndpoint) {
      setAssistantError("Falta configurar la URL del asistente. Revisa la configuración del sitio.");
      return;
    }
    setAsking(true);
    setAssistantError("");
    setAnswer("");
    try {
      const client = new StudyAssistantClient(assistantEndpoint);
      const result = await client.ask(
        user,
        question.trim(),
        files
          .filter((file) => profile.role !== "owner" || file.ownerUid === profile.uid)
          .map((file) => file.id),
      );
      setAnswer(result.answer);
      setAnswerSources(result.sources);
    } catch (error) {
      setAssistantError(getErrorMessage(error));
    } finally {
      setAsking(false);
    }
  }

  const navItems: { id: Section; label: string; icon: typeof BookOpen }[] = [
    { id: "home", label: "INICIO", icon: Clipboard },
    { id: "materials", label: profile.role === "owner" ? "GESTIONAR AULA" : "MATERIALES", icon: BookOpen },
    { id: "room", label: "MEET ROOM", icon: Video },
    { id: "library", label: "ALMACÉN", icon: FolderOpen },
    { id: "assistant", label: "ASISTENTE RAG", icon: MessageCircle },
  ];

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <a className="brutal-brand" href="#aula"><span>S!</span> SPEAKEACOOL</a>
        <p className="portal-kicker">ESPACIO DE APRENDIZAJE</p>
        <nav className="portal-nav" aria-label="Secciones del aula">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              aria-current={section === id ? "page" : undefined}
              className={section === id ? "active" : ""}
              key={id}
              onClick={() => onSectionChange(id)}
              type="button"
            >
              <Icon size={17} /> {label} <ChevronRight className="portal-nav-arrow" size={16} />
            </button>
          ))}
        </nav>
        <div className="portal-sidebar-bottom">
          <span className="role-tag">{profile.role === "owner" ? "PROPIETARIO / TUTOR" : "ESTUDIANTE"}</span>
          <strong>{profile.displayName || profile.email}</strong>
          <button
            className="sidebar-logout"
            onClick={() => void signOutAccount().then(onSignedOut).catch((error: unknown) => setResourceError(getErrorMessage(error)))}
            type="button"
          >
            <LogOut size={15} /> CERRAR SESIÓN
          </button>
          <button className="sidebar-exit" onClick={onExit} type="button">
            <ArrowLeft size={15} /> VOLVER AL SITIO
          </button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <span className="portal-topbar-label">AULA / {navItems.find((item) => item.id === section)?.label}</span>
          <span className="portal-live"><i /> ESPACIO PRIVADO</span>
        </header>
        {resourceError && <p className="portal-feedback error" role="alert">{resourceError}</p>}
        {section === "home" && (
          <HomeSection
            profile={profile}
            fileCount={files.length}
            unitCount={learningContent.length}
            onNavigate={onSectionChange}
          />
        )}
        {section === "materials" && (
          <MaterialsSection
            profile={profile}
            contents={learningContent}
            loading={resourcesLoading}
            onSave={saveContent}
            onDelete={(content) => void deleteContent(content)}
          />
        )}
        {section === "room" && (
          <RoomSection
            roomCode={roomCode}
            active={roomActive}
            copied={copied}
            onCodeChange={setRoomCode}
            onJoin={() => {
              const normalized = roomCode.trim().replace(/[^a-zA-Z0-9-]/g, "");
              if (normalized.length < 4) return;
              setRoomCode(normalized);
              setRoomActive(true);
            }}
            onCreate={() => {
              const code = `SPEAKEACOOL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
              setRoomCode(code);
              setRoomActive(true);
            }}
            onLeave={() => setRoomActive(false)}
            onCopy={() => {
              void navigator.clipboard.writeText(`https://meet.jit.si/${encodeURIComponent(roomCode)}`)
                .then(() => setCopied(true))
                .catch((error: unknown) => setResourceError(getErrorMessage(error)));
            }}
          />
        )}
        {section === "library" && (
          <LibrarySection
            profile={profile}
            files={files}
            students={students}
            loading={resourcesLoading}
            uploadMessage={uploadMessage}
            uploading={uploading}
            onUpload={submitUpload}
            onPreview={(file) => void previewFile(file)}
            onDelete={(file) => void deleteFile(file)}
          />
        )}
        {section === "assistant" && (
          <AssistantSection
            question={question}
            answer={answer}
            sources={answerSources}
            error={assistantError}
            asking={asking}
            connected={Boolean(assistantEndpoint)}
            onQuestionChange={setQuestion}
            onSubmit={askAssistant}
            onSpeak={(text) => speechService.speak(text)}
            onStopSpeaking={() => speechService.stop()}
            speechAvailable={speechService.available}
          />
        )}
        {preview && (
          <FilePreview
            file={preview.file}
            blob={preview.blob}
            onClose={() => setPreview(null)}
          />
        )}
      </main>
    </div>
  );
}

function HomeSection({
  profile,
  fileCount,
  unitCount,
  onNavigate,
}: {
  profile: AccountProfile;
  fileCount: number;
  unitCount: number;
  onNavigate: (section: Section) => void;
}) {
  return (
    <section className="portal-content">
      <p className="brutal-eyebrow">EDUCACIÓN EN MOVIMIENTO · 01</p>
      <h1 className="portal-title">QUÉ BUENO<br />TENERTE <span>AQUÍ.</span></h1>
      <p className="portal-intro">
        {profile.role === "owner"
          ? "Tu panel de tutoría está listo. Crea prácticas, comparte recursos, abre una sala y acompaña cada avance."
          : "Tu espacio está listo. Explora el material, guarda tus archivos y avanza paso a paso."}
      </p>
      <div className="portal-stats">
        <div><strong>{unitCount.toString().padStart(2, "0")}</strong><span>RUTAS DE AVANCE</span></div>
        <div><strong>{fileCount.toString().padStart(2, "0")}</strong><span>ARCHIVOS EN TU ALMACÉN</span></div>
        <div><strong>01:1</strong><span>APRENDIZAJE PERSONAL</span></div>
      </div>
      <div className="portal-block-heading"><span>01 / TU SIGUIENTE PASO</span><span>ELIGE UNA ACCIÓN ↘</span></div>
      <div className="portal-action-grid">
        <button onClick={() => onNavigate("materials")} type="button">
          <BookOpen size={23} /><strong>ABRIR MATERIALES</strong><span>Rutas, práctica y respuestas <ArrowUpRight size={17} /></span>
        </button>
        <button onClick={() => onNavigate("room")} type="button">
          <Video size={23} /><strong>ENTRAR AL MEET ROOM</strong><span>Videollamada y compartir pantalla <ArrowUpRight size={17} /></span>
        </button>
        <button onClick={() => onNavigate("library")} type="button">
          <FolderOpen size={23} /><strong>IR AL ALMACÉN</strong><span>Notas y documentos · máx. 20 MB <ArrowUpRight size={17} /></span>
        </button>
        <button onClick={() => onNavigate("assistant")} type="button">
          <MessageCircle size={23} /><strong>CONSULTAR AL ASISTENTE</strong><span>Preguntas sobre el material <ArrowUpRight size={17} /></span>
        </button>
      </div>
      <p className="portal-signoff">APRENDER NO ES QUEDARSE QUIETO. ES PROBAR, ERRAR Y VOLVER A INTENTAR.</p>
    </section>
  );
}

function MaterialsSection({
  profile,
  contents,
  loading,
  onSave,
  onDelete,
}: {
  profile: AccountProfile;
  contents: LearningContent[];
  loading: boolean;
  onSave: (content: Omit<LearningContent, "id" | "ownerUid">, id?: string) => Promise<void>;
  onDelete: (content: LearningContent) => void;
}) {
  const [openPractice, setOpenPractice] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<LearningContent | null>(null);
  return (
    <section className="portal-content">
      <p className="brutal-eyebrow">RUTAS DE APRENDIZAJE · 02</p>
      <h1 className="portal-title">ESTUDIA.<br /><span>PRACTICA.</span></h1>
      <p className="portal-intro">
        {profile.role === "owner"
          ? "Crea las rutas y prácticas de tu clase. Solo el propietario del aula puede publicar o modificar su contenido."
          : "Consulta las rutas publicadas por tu tutor y practica aquí mismo, sin descargar ni imprimir hojas."}
      </p>
      {profile.role === "owner" && (
        <div className="teacher-content-actions">
          <button
            className="brutal-button button-acid"
            onClick={() => setEditingContent(editingContent ? null : emptyLearningContent())}
            type="button"
          >
            {editingContent ? "CERRAR EDITOR" : "CREAR MATERIAL"} <ArrowUpRight size={17} />
          </button>
        </div>
      )}
      {profile.role === "owner" && editingContent && (
        <LearningContentEditor
          key={editingContent.id || "new"}
          content={editingContent}
          onCancel={() => setEditingContent(null)}
          onSave={async (content) => {
            await onSave(content, editingContent.id || undefined);
            setEditingContent(null);
          }}
        />
      )}
      {loading ? <p className="empty-library">CARGANDO MATERIALES…</p> : contents.length === 0 ? (
        <p className="empty-library">
          {profile.role === "owner"
            ? "AÚN NO HAY MATERIALES. CREA UNA RUTA PARA TU CLASE."
            : "AÚN NO HAY MATERIALES PUBLICADOS POR TU TUTOR."}
        </p>
      ) : (
      <div className="unit-grid">
        {contents.map((unit, index) => (
          <article className="unit-card" key={unit.id}>
            <span className="unit-level">{unit.level}</span>
            <span className="unit-index">{String(index + 1).padStart(2, "0")}</span>
            <h2>{unit.title}</h2>
            <p>{unit.goal}</p>
            <ul>{unit.topics.map((topic) => <li key={topic}><Check size={14} /> {topic}</li>)}</ul>
            {profile.role === "owner" && (
              <span className={unit.published ? "content-state published" : "content-state"}>
                {unit.published ? "PUBLICADO" : "BORRADOR"}
              </span>
            )}
            <button
              className="unit-open"
              onClick={() => setOpenPractice(openPractice === unit.id ? null : unit.id)}
              type="button"
            >
              {openPractice === unit.id ? "CERRAR PRÁCTICA" : "ABRIR PRÁCTICA"}
              <ArrowUpRight size={16} />
            </button>
            {profile.role === "owner" && (
              <div className="content-card-actions">
                <button onClick={() => setEditingContent(unit)} type="button">EDITAR</button>
                <button onClick={() => onDelete(unit)} type="button">ELIMINAR</button>
              </div>
            )}
          </article>
        ))}
      </div>
      )}
      {openPractice && contents.some((practice) => practice.id === openPractice) && (
        <PracticeSheetView
          key={openPractice}
          practice={contents.find((practice) => practice.id === openPractice)!}
          onClose={() => setOpenPractice(null)}
        />
      )}
      <p className="portal-signoff">NO BUSQUES LA FRASE PERFECTA. BUSCA LA SIGUIENTE OPORTUNIDAD PARA HABLAR.</p>
    </section>
  );
}

function emptyLearningContent(): LearningContent {
  return {
    id: "",
    level: "",
    title: "",
    goal: "",
    topics: [],
    focus: "",
    instructions: "",
    exercises: [],
    answerKey: [],
    speakingPrompt: "",
    published: false,
    ownerUid: "",
  };
}

function LearningContentEditor({
  content,
  onCancel,
  onSave,
}: {
  content: LearningContent;
  onCancel: () => void;
  onSave: (content: Omit<LearningContent, "id" | "ownerUid">) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const exercises = String(form.get("exercises") || "").split("\n").map((line) => line.trim()).filter(Boolean);
    const answerKey = String(form.get("answerKey") || "").split("\n").map((line) => line.trim()).filter(Boolean);
    if (exercises.length === 0 || exercises.length !== answerKey.length) {
      setError("Cada ejercicio debe tener una respuesta en la misma posición. Separa alternativas con |.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await onSave({
        level: String(form.get("level") || "").trim(),
        title: String(form.get("title") || "").trim(),
        goal: String(form.get("goal") || "").trim(),
        topics: String(form.get("topics") || "").split("\n").map((line) => line.trim()).filter(Boolean),
        focus: String(form.get("focus") || "").trim(),
        instructions: String(form.get("instructions") || "").trim(),
        exercises,
        answerKey,
        speakingPrompt: String(form.get("speakingPrompt") || "").trim(),
        published: form.get("published") === "on",
      });
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="learning-editor" onSubmit={(event) => void submit(event)}>
      <h2>{content.id ? "EDITAR RUTA" : "NUEVA RUTA Y PRÁCTICA"}</h2>
      <div className="editor-fields">
        <label><span>NIVEL</span><input defaultValue={content.level} maxLength={40} name="level" required /></label>
        <label><span>TÍTULO</span><input defaultValue={content.title} maxLength={120} name="title" required /></label>
        <label className="editor-wide"><span>OBJETIVO</span><textarea defaultValue={content.goal} maxLength={500} name="goal" required rows={2} /></label>
        <label><span>ENFOQUE</span><input defaultValue={content.focus} maxLength={120} name="focus" required /></label>
        <label><span>INSTRUCCIONES</span><input defaultValue={content.instructions} maxLength={500} name="instructions" required /></label>
        <label><span>TEMAS · UNO POR LÍNEA</span><textarea defaultValue={content.topics.join("\n")} name="topics" required rows={4} /></label>
        <label><span>EJERCICIOS · UNO POR LÍNEA</span><textarea defaultValue={content.exercises.join("\n")} name="exercises" required rows={5} /></label>
        <label><span>RESPUESTAS · MISMO ORDEN, | PARA ALTERNATIVAS</span><textarea defaultValue={content.answerKey.join("\n")} name="answerKey" required rows={5} /></label>
        <label className="editor-wide"><span>CONSIGNA PARA HABLAR</span><textarea defaultValue={content.speakingPrompt} maxLength={500} name="speakingPrompt" required rows={2} /></label>
      </div>
      <label className="publish-toggle"><input defaultChecked={content.published} name="published" type="checkbox" /> PUBLICAR PARA ESTUDIANTES</label>
      {error && <p className="portal-feedback error" role="alert">{error}</p>}
      <div className="editor-actions">
        <button className="brutal-button button-acid" disabled={busy} type="submit">{busy ? "GUARDANDO…" : "GUARDAR RUTA"}</button>
        <button className="brutal-button button-light" onClick={onCancel} type="button">CANCELAR</button>
      </div>
    </form>
  );
}

function PracticeSheetView({
  practice,
  onClose,
}: {
  practice: LearningContent;
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<string[]>(() => practice.exercises.map(() => ""));
  const [checked, setChecked] = useState(false);
  const normalize = (answer: string) => answer.trim().toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ");
  const correctAnswers = answers.filter((answer, index) =>
    practice.answerKey[index]
      .split("|")
      .some((candidate) => normalize(candidate) === normalize(answer)),
  ).length;

  return (
    <article className="practice-sheet">
      <div className="practice-heading">
        <div><span className="unit-level">{practice.level} / HOJA DE PRÁCTICA</span><h2>{practice.title}</h2></div>
        <div className="practice-actions">
          <button className="close-practice" onClick={onClose} type="button">CERRAR ×</button>
        </div>
      </div>
      <p className="practice-focus">ENFOQUE: {practice.focus}</p>
      <p>{practice.instructions}</p>
      <ol className="exercise-list">{practice.exercises.map((exercise, index) => (
        <li key={`${index}-${exercise}`}>
          <label>
            <span>{exercise}</span>
            <input
              aria-label={`Respuesta al ejercicio ${index + 1}`}
              autoComplete="off"
              onChange={(event) => {
                setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer));
                setChecked(false);
              }}
              value={answers[index]}
            />
          </label>
        </li>
      ))}</ol>
      <button className="brutal-button button-acid" onClick={() => setChecked(true)} type="button">REVISAR RESPUESTAS <Check size={16} /></button>
      {checked && <p className="practice-result" role="status">RESULTADO: {correctAnswers} / {practice.exercises.length} · {correctAnswers === practice.exercises.length ? "PERFECTO, THAT'S THE ONE." : "REVISA Y VUELVE A INTENTAR."}</p>}
      <div className="speaking-box"><strong>HABLEMOS</strong><p>{practice.speakingPrompt}</p></div>
      {checked && <details className="answer-key">
        <summary>VER CLAVE DE RESPUESTAS</summary>
        <ol>{practice.answerKey.map((answer) => <li key={answer}>{answer}</li>)}</ol>
      </details>}
    </article>
  );
}

function RoomSection({
  roomCode,
  active,
  copied,
  onCodeChange,
  onJoin,
  onCreate,
  onLeave,
  onCopy,
}: {
  roomCode: string;
  active: boolean;
  copied: boolean;
  onCodeChange: (value: string) => void;
  onJoin: () => void;
  onCreate: () => void;
  onLeave: () => void;
  onCopy: () => void;
}) {
  return (
    <section className="portal-content">
      <p className="brutal-eyebrow">VIDEOLLAMADA · 03</p>
      <h1 className="portal-title">NOS VEMOS<br /><span>EN EL AULA.</span></h1>
      <p className="portal-intro">Inicia una sala nueva o escribe el código que te compartió tu tutor. La sala incluye cámara, micrófono y compartir pantalla.</p>
      <div className="room-panel">
        {!active ? (
          <>
            <div className="room-controls">
              <button className="brutal-button button-acid" onClick={onCreate} type="button"><Video size={17} /> CREAR SALA NUEVA</button>
              <span>O ENTRA A UNA EXISTENTE</span>
              <label className="room-code-field">
                <span>CÓDIGO DE SALA</span>
                <input
                  maxLength={70}
                  onChange={(event) => onCodeChange(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") onJoin(); }}
                  placeholder="SPEAKEACOOL-XXXXXXXX"
                  value={roomCode}
                />
              </label>
              <button className="brutal-button button-dark" disabled={roomCode.trim().length < 4} onClick={onJoin} type="button">ENTRAR <ArrowUpRight size={17} /></button>
            </div>
            <div className="room-notice"><MonitorUp size={19} /><p>Al entrar, permite cámara y micrófono en el navegador. Usa <strong>Compartir pantalla</strong> dentro de la sala; esta opción depende del navegador y del dispositivo.</p></div>
          </>
        ) : (
          <>
            <div className="room-toolbar">
              <div><span className="portal-live"><i /> SALA ACTIVA</span><strong>{roomCode}</strong></div>
              <div className="room-toolbar-actions">
                <button className="brutal-button button-light" onClick={onCopy} type="button"><Clipboard size={15} /> {copied ? "ENLACE COPIADO" : "COPIAR ENLACE"}</button>
                <button className="brutal-button button-dark" onClick={onLeave} type="button">SALIR DE LA VISTA</button>
              </div>
            </div>
            <div className="meet-frame">
              <iframe
                allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-read; clipboard-write"
                allowFullScreen
                referrerPolicy="no-referrer"
                src={`https://meet.jit.si/${encodeURIComponent(roomCode)}#config.prejoinConfig.enabled=true&interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true`}
                title={`Sala de videollamada ${roomCode}`}
              />
            </div>
            <p className="meet-disclaimer">La videollamada se ejecuta en Jitsi Meet. El código de sala funciona como enlace de acceso; compártelo solo con las personas invitadas. No subas información sensible a la sala.</p>
          </>
        )}
      </div>
    </section>
  );
}

function LibrarySection({
  profile,
  files,
  students,
  loading,
  uploadMessage,
  uploading,
  onUpload,
  onPreview,
  onDelete,
}: {
  profile: AccountProfile;
  files: StoredFile[];
  students: StudentAccount[];
  loading: boolean;
  uploadMessage: string;
  uploading: boolean;
  onUpload: (event: FormEvent<HTMLFormElement>) => void;
  onPreview: (file: StoredFile) => void;
  onDelete: (file: StoredFile) => void;
}) {
  return (
    <section className="portal-content">
      <p className="brutal-eyebrow">ARCHIVOS PRIVADOS · 04</p>
      <h1 className="portal-title">GUARDA.<br /><span>ENCUENTRA.</span></h1>
      <p className="portal-intro">
        {profile.role === "owner"
          ? "Sube material de clase para que tus estudiantes lo consulten aquí. Solo el propietario puede cargar archivos."
          : "Consulta aquí los documentos que tu tutor comparta. El aula no ofrece botones para descargar ni imprimir."}
      </p>
      {profile.role === "owner" && <form className="file-upload" onSubmit={(event) => void onUpload(event)}>
        <div className="upload-title"><Upload size={19} /><strong>SUBIR DOCUMENTO</strong><span>PDF, DOCX, texto o imagen · hasta 20 MB</span></div>
        <input accept={allowedFileTypes} name="file" required type="file" />
        <button className="brutal-button button-acid" disabled={uploading} type="submit">
          {uploading ? "SUBIENDO…" : "PUBLICAR EN EL ALMACÉN"} <ArrowUpRight size={17} />
        </button>
        {uploadMessage && <p className={uploadMessage.startsWith("ARCHIVO") ? "portal-feedback success" : "portal-feedback error"} role="status">{uploadMessage}</p>}
      </form>}
      <div className="library-heading"><h2>DOCUMENTOS</h2><span>{files.length.toString().padStart(2, "0")} ARCHIVOS · LÍMITE 100</span></div>
      {loading ? <p className="empty-library">CARGANDO ARCHIVOS…</p> : files.length === 0 ? (
        <p className="empty-library">AÚN NO HAY ARCHIVOS. AL SUBIR UNO, APARECERÁ AQUÍ.</p>
      ) : (
        <div className="file-list">
          {files.map((file) => {
            const ownerName = students.find((student) => student.uid === file.ownerUid)?.displayName;
            const canDelete = profile.role === "owner"
              || (file.category === "student" && file.ownerUid === profile.uid);
            return (
              <article className="file-row" key={file.id}>
                <FileText size={21} />
                <div><strong>{file.name}</strong><span>{file.category === "student" ? "ARCHIVO PROPIO" : "MATERIAL DEL TUTOR"}{profile.role === "owner" && ownerName ? ` · ${ownerName}` : ""}</span></div>
                <button className="file-action" onClick={() => onPreview(file)} type="button"><Eye size={15} /> VER EN EL AULA</button>
                {canDelete && <button aria-label={`Eliminar ${file.name}`} className="file-delete" onClick={() => onDelete(file)} type="button">ELIMINAR</button>}
              </article>
            );
          })}
        </div>
      )}
      <p className="storage-note">Los archivos requieren iniciar sesión y se muestran dentro del aula. La web no puede impedir capturas de pantalla, fotografías externas ni otras copias realizadas desde el dispositivo.</p>
    </section>
  );
}

function FilePreview({
  file,
  blob,
  onClose,
}: {
  file: StoredFile;
  blob: Blob;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const documentContainer = useRef<HTMLDivElement>(null);
  const styleContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setPreviewError("");
    setText("");
    setUrl("");
    if (file.contentType === "text/plain") {
      void blob.text()
        .then((value) => { if (active) setText(value); })
        .catch((error: unknown) => { if (active) setPreviewError(getErrorMessage(error)); });
    } else if (file.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const body = documentContainer.current;
      const styles = styleContainer.current;
      if (!body || !styles) return;
      body.replaceChildren();
      styles.replaceChildren();
      setPreviewLoading(true);
      void import("docx-preview")
        .then(({ renderAsync }) => active ? renderAsync(blob, body, styles) : undefined)
        .catch((error: unknown) => { if (active) setPreviewError(getErrorMessage(error)); })
        .finally(() => { if (active) setPreviewLoading(false); });
      return () => {
        active = false;
        body.replaceChildren();
        styles.replaceChildren();
      };
    } else if (file.contentType.startsWith("image/") || file.contentType === "application/pdf") {
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      return () => {
        active = false;
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreviewError("Este formato no tiene vista previa integrada. Pide al tutor que lo comparta como PDF.");
    }
    return () => { active = false; };
  }, [blob, file.contentType]);

  return (
    <div className="file-preview-backdrop" role="presentation" onClick={onClose}>
      <section
        aria-label={`Vista previa de ${file.name}`}
        aria-modal="true"
        className="file-preview-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header><strong>{file.name}</strong><button className="close-practice" onClick={onClose} type="button">CERRAR ×</button></header>
        <div className="file-preview-content">
          {previewError ? <p role="alert">{previewError}</p> : null}
          {url && file.contentType === "application/pdf" && (
            <iframe src={`${url}#toolbar=0&navpanes=0`} title={`Vista previa ${file.name}`} />
          )}
          {url && file.contentType.startsWith("image/") && <img alt={file.name} src={url} />}
          {file.contentType === "text/plain" && <pre>{text}</pre>}
          {file.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
            <div className="docx-preview-scroll">
              {previewLoading && <p>ABRIENDO DOCUMENTO…</p>}
              <div className="docx-preview-styles" ref={styleContainer} />
              <div className="docx-preview-body" ref={documentContainer} />
            </div>
          )}
          <span aria-hidden="true" className="preview-watermark">SPEAKEACOOL · MATERIAL DE CLASE</span>
        </div>
        <p className="preview-limit">Vista dentro del aula; no se puede garantizar la prevención de capturas o copias desde el dispositivo.</p>
      </section>
    </div>
  );
}

function AssistantSection({
  question,
  answer,
  sources,
  error,
  asking,
  connected,
  onQuestionChange,
  onSubmit,
  onSpeak,
  onStopSpeaking,
  speechAvailable,
}: {
  question: string;
  answer: string;
  sources: string[];
  error: string;
  asking: boolean;
  connected: boolean;
  onQuestionChange: (question: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
  speechAvailable: boolean;
}) {
  return (
    <section className="portal-content">
      <p className="brutal-eyebrow">ASISTENTE DE ESTUDIO · 05</p>
      <h1 className="portal-title">PREGUNTA.<br /><span>COMPRENDE.</span></h1>
      <p className="portal-intro">Consulta tus documentos y el material de estudio. Las respuestas deben basarse en los archivos a los que tienes acceso.</p>
      <div className={`assistant-status${connected ? " connected" : ""}`}>
        <span><i /> {connected ? "CLOUDFLARE WORKER CONECTADO" : "ESPERANDO CONFIGURACIÓN DE CLOUDFLARE"}</span>
        <p>{connected
          ? "El asistente usa un servicio Worker y Gemini; el token Firebase se valida en el backend antes de consultar archivos permitidos."
          : "La interfaz está preparada, pero todavía no consulta documentos. Despliega worker/ en Cloudflare y configura la URL resultante como VITE_STUDY_ASSISTANT_URL."}</p>
      </div>
      <form className="assistant-form" onSubmit={(event) => void onSubmit(event)}>
        <label htmlFor="assistant-question">¿QUÉ QUIERES ENTENDER?</label>
        <textarea
          id="assistant-question"
          maxLength={1000}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Por ejemplo: ¿cuándo uso present perfect y cuándo past simple?"
          required
          rows={4}
          value={question}
        />
        <button className="brutal-button button-acid" disabled={asking} type="submit">
          {asking ? "BUSCANDO EN LOS MATERIALES…" : "PREGUNTAR"} <Send size={16} />
        </button>
      </form>
      {error && <p className="portal-feedback error" role="alert">{error}</p>}
      {answer && (
        <article className="assistant-answer">
          <div className="assistant-answer-heading">
            <span>RESPUESTA DEL PROFE BOT</span>
            {speechAvailable && (
              <button className="brutal-button button-light" onClick={() => onSpeak(answer)} type="button">
                <Volume2 size={15} /> ESCUCHAR
              </button>
            )}
            {speechAvailable && (
              <button className="brutal-button button-light" onClick={onStopSpeaking} type="button">
                <Square size={13} /> PARAR VOZ
              </button>
            )}
          </div>
          <p>{answer}</p>
          {sources.length > 0 && (
            <div className="assistant-sources">
              <strong>CONSULTÉ ESTAS FUENTES:</strong>
              <ul>{sources.map((source) => <li key={source}>{source}</li>)}</ul>
            </div>
          )}
        </article>
      )}
      <div className="assistant-contract">
        <strong>CONTRATO DE API</strong>
        <code>Cloudflare Worker · Firebase ID token · Gemini API · {"{answer, sources}"}</code>
      </div>
    </section>
  );
}

export default LearningPlatform;
