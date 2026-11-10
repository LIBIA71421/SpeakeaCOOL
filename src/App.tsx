import { lazy, Suspense, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Menu,
  MessageCircle,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import teacherPhoto from "./teacher.jpeg";
import type { Enrollment } from "./enrollment";

const LearningPlatform = lazy(() => import("./LearningPlatform"));

const courses = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Inglés desde cero",
    description: "Empieza con vocabulario y estructuras esenciales, con una ruta paso a paso.",
    tag: "Nivel inicial",
    color: "coral",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Inglés básico",
    description: "Refuerza gramática, lectura y escritura con ejercicios a tu medida.",
    tag: "Construye bases",
    color: "blue",
  },
  {
    number: "03",
    icon: Globe2,
    title: "Inglés intermedio",
    description: "Trabaja con textos y actividades de writing según tu nivel y tus objetivos.",
    tag: "Sigue avanzando",
    color: "green",
  },
  {
    number: "04",
    icon: BookOpen,
    title: "Tutorías escolares",
    description: "Apoyo personalizado en el tema que necesites. Cuéntanos qué materia quieres reforzar.",
    tag: "A pedido",
    color: "blue",
  },
];

const initialForm: Enrollment = {
  name: "",
  email: "",
  phone: "",
  program: "ingles-conversacion",
  modality: "online",
  schedule: "flexible",
  message: "",
};

function App() {
  const [form, setForm] = useState<Enrollment>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(window.location.hash === "#aula");

  function updateField<K extends keyof Enrollment>(field: K, value: Enrollment[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const { saveEnrollment } = await import("./enrollment");
      await saveEnrollment({
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });
      setForm(initialForm);
      setFeedback({
        type: "success",
        message: "¡Listo! Recibimos tu inscripción. Muy pronto nos pondremos en contacto.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos enviar tu inscripción. Inténtalo de nuevo en un momento.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  if (portalOpen) {
    return (
      <Suspense fallback={<div className="portal-loading"><span className="brutal-mark">S!</span><p>ABRIENDO EL AULA…</p></div>}>
        <LearningPlatform
          onExit={() => {
            window.location.hash = "inicio";
            setPortalOpen(false);
          }}
        />
      </Suspense>
    );
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="SpeakeaCOOL, inicio">
          <span className="brand-mark">s<span>.</span></span>
          <span className="brand-name">speakea<span>COOL</span></span>
        </a>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav${mobileMenuOpen ? " is-open" : ""}`} aria-label="Navegación principal">
          <a href="#programas" onClick={closeMobileMenu}>Programas</a>
          <a href="#metodo" onClick={closeMobileMenu}>Cómo funciona</a>
          <a href="#preguntas" onClick={closeMobileMenu}>Preguntas frecuentes</a>
          <a className="portal-nav-link" href="#aula" onClick={() => setPortalOpen(true)}>
            AULA DIGITAL <ArrowUpRight size={15} />
          </a>
          <a className="nav-cta" href="#inscripcion" onClick={closeMobileMenu}>
            Quiero empezar <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero section-shell" id="inicio">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> APRENDER SE SIENTE DIFERENTE</div>
            <h1>Tu próximo<br />gran <span>«hello».</span></h1>
            <p className="hero-description">
              Soy Leonardo Rafael Javier Machicado Encinas, tutor de inglés y estudiante de
              Comunicación Social en la Universidad Mayor de San Simón. Hace años que enseño desde
              una mirada viva, práctica y cercana: aprender inglés no es solo estudiar papel y hoja,
              sino vivirlo, escuchar, hablar, equivocarse y avanzar sin miedo.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#inscripcion">
                Reserva tu primera clase <ArrowRight size={17} />
              </a>
              <a className="text-link" href="#metodo">
                <span className="play-icon"><Play size={13} fill="currentColor" /></span>
                Conoce cómo aprendemos
              </a>
            </div>
            <div className="hero-proof">
              <span className="proof-icon"><CheckCircle2 size={18} /></span>
              <p>Evaluación de nivel y clase de prueba por 30 Bs</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                className="hero-image"
                src={teacherPhoto}
                alt="Leonardo Rafael Javier Machicado Encinas, tutor de inglés"
              />
              <div className="image-label"><span /> AQUÍ SE HABLA, SE RÍE Y SE APRENDE</div>
            </div>
            <div className="floating-note note-top"><Sparkles size={16} /><span>Aprende a tu manera</span></div>
            <div className="floating-note note-bottom">
              <span className="note-icon"><Check size={16} /></span>
              <div><strong>Progreso real</strong><small>pasito a pasito</small></div>
            </div>
            <div className="scribble" aria-hidden="true">hello!</div>
            <div className="hero-image-index">01 <span>/</span> 03</div>
          </div>
          <a href="#programas" className="scroll-cue" aria-label="Desplazarse a programas">
            <ArrowDown size={16} />
          </a>
        </section>

        <section className="stats-strip" aria-label="SpeakeaCOOL en números">
          <div className="stats-inner">
            <p>Información clara para<br />dar el primer paso.</p>
            <div className="stat"><strong>30 <span>Bs</span></strong><small>Primera clase y examen</small></div>
            <div className="stat"><strong>1:1</strong><small>Atención personal</small></div>
            <div className="stat"><strong>+591 69776391</strong><small>Contacto directo por WhatsApp</small></div>
            <div className="stats-sparkle"><Sparkles size={23} /></div>
          </div>
        </section>

        <section className="programs section-shell" id="programas">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> RUTAS SEGÚN TU NIVEL</div>
              <h2>Un buen lugar<br />para <span>empezar.</span></h2>
            </div>
            <p>Estas rutas son una guía inicial: en la evaluación vemos qué sabes y ajustamos el contenido contigo.</p>
          </div>
          <div className="course-grid">
            {courses.map(({ number, icon: Icon, title, description, tag, color }) => (
              <a className={`course-card course-${color}`} href="#inscripcion" key={number}>
                <div className="course-top">
                  <span className="course-icon"><Icon size={20} strokeWidth={1.8} /></span>
                  <span className="course-tag">{tag}</span>
                </div>
                <span className="course-number">{number} / SPEAKEACOOL</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="course-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="manifesto" id="nosotros">
          <div className="manifesto-image">
            <img
              src={teacherPhoto}
              alt="Leonardo Machicado, tutor de inglés"
              loading="lazy"
            />
            <div className="manifesto-sticker"><span>GOOD<br />VIBES</span><Sparkles size={17} /></div>
          </div>
          <div className="manifesto-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> MI FILOSOFÍA</div>
            <h2>Aprender sin<br />miedo. <span>Así sí.</span></h2>
            <p>
              Mi relación con el inglés empezó mucho antes que mis estudios formales. Lo practico
              desde la cuna y lo fui viviendo de manera constante, y eso fue lo que realmente me
              ayudó a internalizarlo. Por eso enseño de otra forma: no memorizamos sin sentido,
              hablamos, escuchamos, nos equivocamos, y poco a poco lo hacemos parte de nosotros.
            </p>
            <ul className="value-list">
              <li><span><Check size={14} /></span> Acompañamiento real y adaptado a tu ritmo</li>
              <li><span><Check size={14} /></span> Clases enfocadas en conversación y uso práctico</li>
              <li><span><Check size={14} /></span> Material pensado para tus metas y tu día a día</li>
            </ul>
            <a className="text-link manifesto-link" href="#inscripcion">
              Cuéntanos qué necesitas <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <section className="method-section section-shell" id="metodo">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> ASÍ EMPEZAMOS</div>
              <h2>Un plan claro,<br /><span>a tu medida.</span></h2>
            </div>
            <p>Primero conocemos tus objetivos y luego acordamos el contenido y el horario de las clases.</p>
          </div>
          <div className="method-grid">
            <article className="method-card">
              <span className="method-number">01</span>
              <h3>Conocemos tu punto de partida</h3>
              <p>Conversamos sobre lo que necesitas y hacemos una evaluación de nivel para ver tu punto de partida.</p>
            </article>
            <article className="method-card">
              <span className="method-number">02</span>
              <h3>Probamos la dinámica</h3>
              <p>Tu primera clase y examen tienen un valor de 30 Bs, para que puedas empezar con una base real.</p>
            </article>
            <article className="method-card">
              <span className="method-number">03</span>
              <h3>Avanzamos a tu ritmo</h3>
              <p>Preparamos material personalizado y coordinamos cada horario según tu disponibilidad y tus metas.</p>
            </article>
          </div>
          <div className="service-note">
            <span className="service-note-icon"><Globe2 size={18} /></span>
            <p><strong>En Cochabamba o en línea.</strong> Las clases presenciales se coordinan en Cochabamba; la modalidad online está disponible para otros departamentos.</p>
          </div>
        </section>

        <section className="faq-section" id="preguntas">
          <div className="faq-inner section-shell">
            <div className="section-heading">
              <div>
                <div className="eyebrow"><span className="eyebrow-dot" /> ANTES DE EMPEZAR</div>
                <h2>Preguntas<br /><span>frecuentes.</span></h2>
              </div>
              <p>¿Te queda alguna duda? Déjanos un mensaje y conversamos sobre lo que necesitas.</p>
            </div>
            <div className="faq-list">
              <details className="faq-item">
                <summary>¿Cuánto cuesta la primera clase y el examen?</summary>
                <p>La primera clase y el examen cuestan 30 Bs, y esto sirve para comenzar con una base clara y real sobre tu nivel.</p>
              </details>
              <details className="faq-item">
                <summary>¿Para qué edades y niveles hay clases?</summary>
                <p>Atendemos a personas de todas las edades. Las actividades y los materiales se ajustan a tu nivel y a tus objetivos.</p>
              </details>
              <details className="faq-item">
                <summary>¿Puedo tomar clases desde otro departamento?</summary>
                <p>Sí. Ofrecemos clases en línea para estudiantes de otros departamentos y clases presenciales en Cochabamba.</p>
              </details>
              <details className="faq-item">
                <summary>¿Qué horarios tienen?</summary>
                <p>Los horarios se coordinan según la disponibilidad del estudiante y del tutor.</p>
              </details>
              <details className="faq-item">
                <summary>¿Qué temas puedo estudiar?</summary>
                <p>En inglés trabajamos gramática, lectura y escritura de acuerdo con tu nivel. También puedes consultar por tutorías escolares en el tema que necesites reforzar.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="enrollment-section section-shell" id="inscripcion">
          <div className="enrollment-intro">
            <div className="eyebrow"><span className="eyebrow-dot" /> TU SIGUIENTE PASO EMPIEZA AQUÍ</div>
            <h2>Vamos a hacer<br />que <span>suceda.</span></h2>
            <p>Cuéntanos tu nivel, qué quieres aprender y qué horarios te sirven. Coordinaremos una evaluación y una clase de prueba gratuitas.</p>
            <div className="enrollment-promise">
              <span className="promise-icon"><MessageCircle size={18} /></span>
              <span><strong>Primera clase + examen</strong><small>Valor de 30 Bs para iniciar con claridad.</small></span>
            </div>
            <div className="enrollment-arrow" aria-hidden="true"><ArrowDown size={28} /></div>
          </div>
          <form className="enrollment-form" onSubmit={handleSubmit}>
            <div className="form-heading">
              <div><span className="form-step">01 <span>— EMPECEMOS</span></span><h3>Tu inscripción</h3></div>
              <a className="whatsapp-link" href="https://wa.me/59169776391" target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> +591 69776391
              </a>
              <span className="form-sparkle"><Sparkles size={21} /></span>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Tu nombre</span>
                <input
                  type="text"
                  name="name"
                  placeholder="¿Cómo te llamas?"
                  autoComplete="name"
                  minLength={2}
                  maxLength={80}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Tu correo</span>
                <input
                  type="email"
                  name="email"
                  placeholder="hola@ejemplo.com"
                  autoComplete="email"
                  maxLength={254}
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Teléfono <small>opcional</small></span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+52 55 1234 5678"
                  autoComplete="tel"
                  maxLength={25}
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </label>
              <label className="field">
                <span>¿Qué te interesa?</span>
                <span className="select-wrap">
                  <select
                    name="program"
                    value={form.program}
                    onChange={(event) => updateField("program", event.target.value as Enrollment["program"])}
                  >
                    <option value="ingles-conversacion">Inglés (desde cero, básico o intermedio)</option>
                    <option value="tutorias-escolares">Tutorías escolares</option>
                    <option value="ingles-personalizado">Refuerzo de inglés a medida</option>
                  </select>
                  <ChevronDown size={16} />
                </span>
              </label>
            </div>
            <div className="form-row">
              <fieldset className="field-choice">
                <legend>¿Cómo te gustaría aprender?</legend>
                <div className="choice-options">
                  <label><input type="radio" name="modality" value="online" checked={form.modality === "online"} onChange={() => updateField("modality", "online")} /><span>En línea</span></label>
                  <label><input type="radio" name="modality" value="presencial" checked={form.modality === "presencial"} onChange={() => updateField("modality", "presencial")} /><span>Presencial</span></label>
                  <label><input type="radio" name="modality" value="flexible" checked={form.modality === "flexible"} onChange={() => updateField("modality", "flexible")} /><span>Me da igual</span></label>
                </div>
              </fieldset>
            </div>
            <div className="form-row">
              <label className="field">
                <span>¿Qué horario te viene mejor?</span>
                <span className="select-wrap">
                  <select
                    name="schedule"
                    value={form.schedule}
                    onChange={(event) => updateField("schedule", event.target.value as Enrollment["schedule"])}
                  >
                    <option value="flexible">Tengo flexibilidad</option>
                    <option value="manana">Por la mañana</option>
                    <option value="tarde">Por la tarde</option>
                  </select>
                  <ChevronDown size={16} />
                </span>
              </label>
              <label className="field">
                <span>Algo más que quieras contarnos <small>opcional</small></span>
                <textarea
                  name="message"
                  placeholder="Tu nivel, el tema que quieres trabajar o tus horarios..."
                  maxLength={600}
                  rows={2}
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                />
              </label>
            </div>
            {feedback && (
              <div className={`form-feedback ${feedback.type}`} role="status" aria-live="polite">
                {feedback.type === "success" && <CheckCircle2 size={17} />}
                <span>{feedback.message}</span>
              </div>
            )}
            <div className="form-footer">
              <p>Al enviar, aceptas que nos pongamos en contacto contigo sobre tu inscripción.</p>
              <button className="button button-dark submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar mi inscripción"}
                {!isSubmitting && <ArrowRight size={17} />}
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#inicio">
          <span className="brand-mark">s<span>.</span></span>
          <span className="brand-name">speakea<span>COOL</span></span>
        </a>
        <p>Aprender a tu manera. Y disfrutarlo en el camino.</p>
        <a className="back-top" href="#inicio">Volver arriba <ArrowUpRight size={15} /></a>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SpeakeaCOOL. Hecho con buena onda.</span>
          <span>Una palabra nueva, un mundo nuevo. <span className="footer-heart">♥</span></span>
        </div>
      </footer>
    </>
  );
}

export default App;
