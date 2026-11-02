import { useState, type FormEvent } from "react";
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
import { saveEnrollment, type Enrollment } from "./firebase";

const courses = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Inglés conversacional",
    description: "Habla con seguridad desde el primer día. Sin miedo a equivocarte.",
    tag: "El favorito",
    color: "coral",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Tutorías escolares",
    description: "Un empujoncito en esas materias que necesitan más atención.",
    tag: "A tu ritmo",
    color: "blue",
  },
  {
    number: "03",
    icon: Globe2,
    title: "Inglés personalizado",
    description: "Prepara tus metas, tu viaje o esa próxima gran oportunidad.",
    tag: "1:1 contigo",
    color: "green",
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

  function updateField<K extends keyof Enrollment>(field: K, value: Enrollment[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
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
          <a href="#nosotros" onClick={closeMobileMenu}>Nuestra onda</a>
          <a href="#opiniones" onClick={closeMobileMenu}>Opiniones</a>
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
              Menos memorizar. Más conversar, descubrir y llegar más lejos. Aprender puede ser
              tu parte favorita del día.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#inscripcion">
                Encuentra tu programa <ArrowRight size={17} />
              </a>
              <a className="text-link" href="#programas">
                <span className="play-icon"><Play size={13} fill="currentColor" /></span>
                Conoce cómo aprendemos
              </a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span className="avatar avatar-one">M</span>
                <span className="avatar avatar-two">J</span>
                <span className="avatar avatar-three">A</span>
                <span className="avatar avatar-four">L</span>
              </div>
              <div>
                <div className="proof-stars" aria-label="5 de 5 estrellas">★★★★★</div>
                <p>Una comunidad que aprende unida</p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                className="hero-image"
                src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1100&q=85"
                alt="Estudiantes aprendiendo y conversando en un espacio luminoso"
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
            <p>Un espacio para avanzar<br />a tu propio ritmo.</p>
            <div className="stat"><strong>100<span>%</span></strong><small>Enfoque en ti</small></div>
            <div className="stat"><strong>1:1</strong><small>Atención cercana</small></div>
            <div className="stat"><strong>∞</strong><small>Formas de aprender</small></div>
            <div className="stats-sparkle"><Sparkles size={23} /></div>
          </div>
        </section>

        <section className="programs section-shell" id="programas">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> UN PLAN HECHO PARA TI</div>
              <h2>¿Qué te gustaría<br />lograr <span>hoy?</span></h2>
            </div>
            <p>Grandes metas, pequeños pasos. Elige por dónde empezar y nosotros te acompañamos.</p>
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
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1100&q=85"
              alt="Compañeros compartiendo una experiencia de aprendizaje"
              loading="lazy"
            />
            <div className="manifesto-sticker"><span>GOOD<br />VIBES</span><Sparkles size={17} /></div>
          </div>
          <div className="manifesto-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> NUESTRA FILOSOFÍA</div>
            <h2>Aprender sin<br />miedo. <span>Así sí.</span></h2>
            <p>
              Aquí no necesitas saberlo todo. Solo tener ganas de intentarlo. Creamos un espacio
              cálido, cercano y lleno de buena onda para que cada persona encuentre su voz.
            </p>
            <ul className="value-list">
              <li><span><Check size={14} /></span> Clases con personas reales, no robots</li>
              <li><span><Check size={14} /></span> Ritmo personalizado, cero presión</li>
              <li><span><Check size={14} /></span> Avances que se sienten en la vida real</li>
            </ul>
            <a className="text-link manifesto-link" href="#inscripcion">
              Conoce tu siguiente paso <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <section className="testimonial-section" id="opiniones">
          <div className="testimonial-sparkle sparkle-left"><Sparkles size={24} /></div>
          <div className="testimonial-content">
            <div className="eyebrow"><span className="eyebrow-dot" /> PALABRAS BONITAS, PROGRESO REAL</div>
            <div className="testimonial-stars" aria-label="5 de 5 estrellas">★★★★★</div>
            <blockquote>
              “Por primera vez, aprender inglés se siente como platicar con amigos. Ya no me da
              pena equivocarme.”
            </blockquote>
            <div className="testimonial-author">
              <span className="author-avatar">S</span>
              <span><strong>Sofía R.</strong><small>Alumna de inglés conversacional</small></span>
            </div>
          </div>
          <div className="testimonial-decoration" aria-hidden="true">“</div>
          <div className="testimonial-sparkle sparkle-right"><Sparkles size={18} /></div>
        </section>

        <section className="enrollment-section section-shell" id="inscripcion">
          <div className="enrollment-intro">
            <div className="eyebrow"><span className="eyebrow-dot" /> TU SIGUIENTE PASO EMPIEZA AQUÍ</div>
            <h2>Vamos a hacer<br />que <span>suceda.</span></h2>
            <p>Cuéntanos un poquito de ti. Nos pondremos en contacto para encontrar el programa perfecto para tus metas.</p>
            <div className="enrollment-promise">
              <span className="promise-icon"><MessageCircle size={18} /></span>
              <span><strong>Sin compromiso</strong><small>Solo una conversación para empezar.</small></span>
            </div>
            <div className="enrollment-arrow" aria-hidden="true"><ArrowDown size={28} /></div>
          </div>
          <form className="enrollment-form" onSubmit={handleSubmit}>
            <div className="form-heading">
              <div><span className="form-step">01 <span>— EMPECEMOS</span></span><h3>Tu inscripción</h3></div>
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
                    <option value="ingles-conversacion">Inglés conversacional</option>
                    <option value="tutorias-escolares">Tutorías escolares</option>
                    <option value="ingles-personalizado">Inglés personalizado</option>
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
                  placeholder="Tus metas, dudas o cualquier cosa..."
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
