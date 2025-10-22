import React, { useEffect, useState } from "react";
import localforage from "localforage";
import "./App.css";
import Youtube from 'react-youtube'

import logo from '../assets/img/edumax-logo.png'

const STORAGE_KEYS = {
  USERS: "edumax_users",
  RESOURCES: "edumax_resources",
  CURRENT_USER: "edumax_current_user",
};

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function App() {
  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'

  // Forms
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "",
    file: null,
  });

  // Data
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const videoOptions = {
      height: '340',
      width: '540',
      playerVars: {
          autoplay: 1,
      },
  }

  const categories = [
    "Todos",
    "Matemáticas",
    "Literatura",
    "Ciencias",
    "Historia",
    "Idiomas",
    "Tecnología",
    "Arte",
    "Filosofía",
    "Economía",
    "Derecho",
  ];

  // ---------- localforage init & load ----------
  useEffect(() => {
    // configure localforage (optional)
    localforage.config({
      name: "BibliotecaEdumax",
      storeName: "edumax_store",
    });

    async function load() {
      const savedUsers = (await localforage.getItem(STORAGE_KEYS.USERS)) || [];
      const savedResources =
        (await localforage.getItem(STORAGE_KEYS.RESOURCES)) || getInitialResources();
      const savedCurrentUser = await localforage.getItem(STORAGE_KEYS.CURRENT_USER);

      setUsers(savedUsers);
      setResources(savedResources);
      if (savedCurrentUser) {
        setCurrentUser(savedCurrentUser);
        setIsLoggedIn(true);
      }
    }
    load();
    // scroll spy for activeSection
    const handleScroll = () => {
      const sections = ["home", "about", "resources", "features", "testimonials", "contact"];
      const scrollPosition = window.scrollY + 120;
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(s);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------- helpers ----------
  function getInitialResources() {
    // sample resources with no stored Blob (for first time)
    const now = Date.now();
    return [
      {
        id: "r1",
        title: "Manual de Matemáticas Avanzadas",
        description: "Guía completa para estudiantes universitarios",
        type: "PDF",
        pages: "450 páginas",
        downloads: "2,150+",
        rating: 4.8,
        category: "Matemáticas",
        createdAt: now - 1000 * 60 * 60 * 24 * 90,
        fileName: null,
        fileBlobKey: null,
        author: "Admin",
      },
      {
        id: "r2",
        title: "Literatura Hispanoamericana",
        description: "Antología de autores clásicos y contemporáneos",
        type: "eBook",
        pages: "320 páginas",
        downloads: "1,890+",
        rating: 4.9,
        category: "Literatura",
        createdAt: now - 1000 * 60 * 60 * 24 * 60,
        fileName: null,
        fileBlobKey: null,
        author: "Admin",
      },
    ];
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  }

  // ---------- auth ----------
  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = registerForm;
    if (!name || !email || !password) {
      alert("Completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Contraseñas no coinciden.");
      return;
    }
    // simple duplicate check
    if (users.find((u) => u.email === email)) {
      alert("Ya existe un usuario con ese correo.");
      return;
    }
    const newUser = { id: `u_${Date.now()}`, name, email, password };
    const updated = [...users, newUser];
    setUsers(updated);
    await localforage.setItem(STORAGE_KEYS.USERS, updated);
    // auto-login
    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    await localforage.setItem(STORAGE_KEYS.CURRENT_USER, {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
    setIsLoggedIn(true);
    setRegisterForm({ name: "", email: "", password: "", confirmPassword: "" });
    setShowAuthModal(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginForm;
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      alert("Usuario o contraseña incorrectos.");
      return;
    }
    setCurrentUser({ id: found.id, name: found.name, email: found.email });
    await localforage.setItem(STORAGE_KEYS.CURRENT_USER, {
      id: found.id,
      name: found.name,
      email: found.email,
    });
    setIsLoggedIn(true);
    setLoginForm({ email: "", password: "" });
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    await localforage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  // ---------- uploads & resources ----------
  // We will store file blobs in localforage under a per-resource blob key.
  const handleUpload = async (e) => {
    e.preventDefault();
    const { title, description, category, file } = uploadForm;
    if (!title || !description || !category || !file) {
      alert("Completa todos los campos y selecciona un archivo.");
      return;
    }
    const id = `res_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const blobKey = `blob_${id}`;
    try {
      // store blob using localforage (it supports Blobs)
      await localforage.setItem(blobKey, file);
      const newResource = {
        id,
        title,
        description,
        type: file.name.split(".").pop().toUpperCase(),
        pages: `${Math.max(1, Math.floor(file.size / 1000))} páginas (estimado)`,
        downloads: "0+",
        rating: 0,
        category,
        createdAt: Date.now(),
        fileName: file.name,
        fileBlobKey: blobKey,
        author: currentUser ? currentUser.name : "Anon",
      };
      const updated = [newResource, ...resources];
      setResources(updated);
      await localforage.setItem(STORAGE_KEYS.RESOURCES, updated);
      setUploadForm({ title: "", description: "", category: "", file: null });
      setShowUploadModal(false);
      alert("Recurso subido correctamente.");
    } catch (err) {
      console.error("Error guardando blob:", err);
      alert("Error subiendo archivo.");
    }
  };

  // Download file stored in localforage
  const handleDownload = async (resource) => {
    if (!resource.fileBlobKey) {
      alert("Este recurso no contiene archivo para descargar.");
      return;
    }
    try {
      const blob = await localforage.getItem(resource.fileBlobKey);
      if (!blob) {
        alert("Archivo no encontrado.");
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.fileName || "recurso";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      // increment downloads (simple simulation)
      const updated = resources.map((r) =>
        r.id === resource.id ? { ...r, downloads: incrementDownloads(r.downloads) } : r
      );
      setResources(updated);
      await localforage.setItem(STORAGE_KEYS.RESOURCES, updated);
    } catch (err) {
      console.error(err);
      alert("Error al descargar el archivo.");
    }
  };

  function incrementDownloads(str) {
    // "0+" => "1", "2,150+" => parse and add 1 then keep + suffix
    const clean = str.replace(/\+/, "").replace(/,/g, "");
    const n = parseInt(clean) || 0;
    const updated = n + 1;
    return `${updated}+`;
  }

  // ---------- derived data ----------
  const filteredResources = resources.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const catOk = selectedCategory === "All" || r.category === selectedCategory;
    if (!q) return catOk;
    return (
      catOk &&
      (r.title.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.author || "").toLowerCase().includes(q))
    );
  });

  // ---------- small UI helpers ----------
  const onFileInputChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setUploadForm((s) => ({ ...s, file: f }));
    }
  };

  // ---------- render ----------
  return (
    <div className="app-root">
      <header className="nav">
        <div className="nav-left" onClick={() => scrollToSection("home")} style={{ cursor: "pointer" }}>
          <div className="logo-box"><img src={logo} alt="logo" width={48} /></div>
          <div>
            <div className="brand">Edumax</div>
            <div className="brand-sub">Calidad de estudio | Calidad de vida</div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link ${activeSection === "home" ? "active" : ""}`}
            onClick={() => scrollToSection("home")}
          >
            Inicio
          </button>
          <button
            className={`nav-link ${activeSection === "about" ? "active" : ""}`}
            onClick={() => scrollToSection("about")}
          >
            Sobre
          </button>
          <button
            className={`nav-link ${activeSection === "resources" ? "active" : ""}`}
            onClick={() => scrollToSection("resources")}
          >
            Recursos
          </button>
          <button
            className={`nav-link ${activeSection === "features" ? "active" : ""}`}
            onClick={() => scrollToSection("features")}
          >
            Características
          </button>
          <button
            className={`nav-link ${activeSection === "testimonials" ? "active" : ""}`}
            onClick={() => scrollToSection("testimonials")}
          >
            Testimonios
          </button>
          <button
            className={`nav-link ${activeSection === "contact" ? "active" : ""}`}
            onClick={() => scrollToSection("contact")}
          >
            Contacto
          </button>
        </nav>

        <div className="nav-actions">
          <div className="search-small">
            <input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-compact"
            />
          </div>

          {isLoggedIn ? (
            <div className="user-area">
              <span className="hello">Hola, {currentUser?.name}</span>
              <button className="btn-outline" onClick={() => setShowUploadModal(true)}>
                Subir
              </button>
              <button className="btn-ghost" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="user-area">
              <button
                className="btn-primary"
                onClick={() => {
                  setAuthMode("login");
                  setShowAuthModal(true);
                }}
              >
                Iniciar sesión
              </button>
            </div>
          )}

          <button className="hamburger" onClick={() => setIsMenuOpen((s) => !s)}>
            ☰
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <button onClick={() => scrollToSection("home")}>Inicio</button>
          <button onClick={() => scrollToSection("about")}>Sobre</button>
          <button onClick={() => scrollToSection("resources")}>Recursos</button>
          <button onClick={() => scrollToSection("contact")}>Contacto</button>
        </div>
      )}

      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero-left">
          <h1>
            <span className="accent">Edumax</span> una nueva forma de estudiar
          </h1>
          <p className="lead">
            Accede a recursos educativos organizados y disponibles 24/7. Comparte conocimiento y colabora con la
            comunidad.
          </p>

          <div className="hero-cta">
            <button className="btn-primary" onClick={() => scrollToSection("resources")}>
              Explorar recursos
            </button>
            <button
              className="btn-outline"
              onClick={() => (isLoggedIn ? setShowUploadModal(true) : setShowAuthModal(true))}
            >
              {isLoggedIn ? "Subir material" : "Registrarse"}
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="card image-card">
            <Youtube videoId="zrx6J9WAmVE" opts={videoOptions} />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section section--light">
        <div className="container">
          <h2>Sobre Biblioteca Edumax</h2>
          <p className="lead">Plataforma dedicada a la preservación y difusión del conocimiento académico.</p>

          <div className="grid-2">
            <div className="card">
              <div className="icon">🎯</div>
              <h3>Nuestra Misión</h3>
              <p>A través de metodologías activas, acompañamiento pedagógico y herramientas digitales, buscamos formar estudiantes autónomos, motivados y conscientes de su propio potencial.</p>
            </div>
            <div className="card">
              <div className="icon">💡</div>
              <h3>Nuestra Visión</h3>
              <p>Para el futuro, EDUMAX será reconocida como una plataforma educativa líder en innovación pedagógica, que integra la tecnología, el bienestar emocional y el aprendizaje activo para transformar la educación en una experiencia significativa y humana.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section id="resources" className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Recursos Educativos</h2>
              <p className="lead">Explora nuestra colección.</p>
            </div>

            <div className="filters">
              <input
                placeholder="Buscar libros, autores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="select">
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                >
                Limpiar
                </button>
              </div>
              </div>

              <div className="grid-cards">
              {/* Helper component to load and show cover image stored in localforage */}
              {/** Note: defining a small component inside render is fine here */}
              {(() => {
                const CoverImage = ({ resource }) => {
                const [src, setSrc] = React.useState(null);

                React.useEffect(() => {
                  let mounted = true;
                  let objUrl = null;
                  async function load() {
                  if (!resource?.coverBlobKey) {
                    return;
                  }
                  try {
                    const b = await localforage.getItem(resource.coverBlobKey);
                    if (mounted && b) {
                    objUrl = window.URL.createObjectURL(b);
                    setSrc(objUrl);
                    }
                  } catch (err) {
                    console.error("Error cargando portada:", err);
                  }
                  }
                  load();
                  return () => {
                  mounted = false;
                  if (objUrl) {
                    window.URL.revokeObjectURL(objUrl);
                  }
                  };
                }, [resource?.coverBlobKey]);

                if (src) {
                  return <img src={src} alt={`${resource.title} - portada`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
                }
                return <div className="thumb-img">{resource.category}</div>;
                };

                return filteredResources.map((r) => (
                <article key={r.id} className="card resource-card">
                  <div className="thumb">
                  <CoverImage resource={r} />

                  {/* hidden input to upload/update cover per resource */}
                  <input
                    id={`cover_input_${r.id}`}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    const coverKey = `cover_${r.id}`;
                    try {
                      await localforage.setItem(coverKey, f);
                      const updated = resources.map((x) =>
                      x.id === r.id ? { ...x, coverBlobKey: coverKey, coverFileName: f.name } : x
                      );
                      setResources(updated);
                      await localforage.setItem(STORAGE_KEYS.RESOURCES, updated);
                      // clear the file input so same file can be re-selected later
                      e.target.value = "";
                      alert("Portada subida correctamente.");
                    } catch (err) {
                      console.error("Error subiendo portada:", err);
                      alert("Error al subir la portada.");
                    }
                    }}
                  />
                  </div>

                  <div className="card-body">
                  <div className="meta">
                    <span className="badge">{r.category}</span>
                    <span className="rating">★ {r.rating ?? "—"}</span>
                  </div>
                  <h3 className="card-title">{r.title}</h3>
                  <p className="muted">{r.description}</p>
                  <div className="card-meta-row">
                    <span className="muted"> {r.type} • {r.pages}</span>
                    <span className="muted">Subido: {formatDate(r.createdAt)}</span>
                  </div>

                  <div className="card-actions">
                    <button className="btn-primary small" onClick={() => handleDownload(r)}>
                    Descargar
                    </button>
                    {isLoggedIn && (
                    <button
                      className="btn-outline small"
                      onClick={async () => {
                      // trigger hidden file input to upload cover
                      const inp = document.getElementById(`cover_input_${r.id}`);
                      if (inp) inp.click();
                      }}
                    >
                      Subir portada
                    </button>
                    )}
                    {isLoggedIn && (
                    <button
                      className="btn-outline small"
                      onClick={async () => {
                      // Quick edit name flow (prompt)
                          const newTitle = prompt("Editar título:", r.title);
                          if (!newTitle) return;
                          const updated = resources.map((x) => (x.id === r.id ? { ...x, title: newTitle } : x));
                          setResources(updated);
                          await localforage.setItem(STORAGE_KEYS.RESOURCES, updated);
                        }}
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          })()}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section section--light">
        <div className="container">
          <h2>Características destacadas</h2>
          <div className="grid-4">
            <div className="card feature">
              <div className="icon">📚</div>
              <h3>Biblioteca Digital</h3>
              <p>Acceso a documentos organizados por categorías y niveles.</p>
            </div>
            <div className="card feature">
              <div className="icon">🔎</div>
              <h3>Búsqueda Inteligente</h3>
              <p>Encuentra rápidamente el material que necesitas.</p>
            </div>
            <div className="card feature">
              <div className="icon">⬆️</div>
              <h3>Subida de Materiales</h3>
              <p>Comparte tus recursos y ayuda a otros estudiantes.</p>
            </div>
            <div className="card feature">
              <div className="icon">✏️</div>
              <h3>Edición Colaborativa</h3>
              <p>Mejora materiales existentes junto a la comunidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="section">
        <div className="container">
          <h2>Testimonios</h2>
          <div className="grid-3">
            {[
              {
                name: "Prof. Ana Martínez",
                role: "Docente Universitaria",
                content:
                  "Esta plataforma ha revolucionado la forma en que comparto materiales con mis estudiantes.",
              },
              {
                name: "Dr. Carlos Rodríguez",
                role: "Investigador",
                content: "Acceder a recursos actualizados ha optimizado mi trabajo de investigación.",
              },
              {
                name: "Lic. María López",
                role: "Coordinadora Pedagógica",
                content: "La plataforma es intuitiva y los materiales están perfectamente organizados.",
              },
            ].map((t, i) => (
              <div key={i} className="card testimonial">
                <div className="avatar">{t.name.split(" ").map((n) => n[0]).join("")}</div>
                <h4>{t.name}</h4>
                <p className="muted">{t.role}</p>
                <p className="italic">"{t.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="section">
        <div className="container">
          <h2>¡Disfruta de minijuegos educativos!</h2>
          <div className="grid-2">
            {[
              {
                name: "Market Mogul",
                link: "https://www.astrocade.com/sharedby/mgambo09/market-mogul/01K84SQXN6DE1QQY5495SXS2V8",
                content:
                  "Aprende sobre economía y negocios de manera divertida. Este juego te dará nociones básicas sobre el trading.",
              },
              {
                name: "Arcane Speller",
                link: "https://www.astrocade.com/sharedby/mgambo09/arcane-speller/01K84BD2FRSMWENYB8HDBEHVD3",
                content: "En este juego serás un mago que necesita recordar el nombre de sus hechizos. Completa palabras en inglés según las pistas y que no te alcancen los monstruos.",
              }
            ].map((t, i) => (
              <div key={i} className="card testimonial">
                <h4>{t.name}</h4>
                <p className="italic">{t.content}</p>
                <a href={t.link} target="_blank" className="btn-primary">Jugar Ahora</a>
              </div>
            ))}
          </div>
        </div>
      </section>

        <section id="contact" className="section section--light">
          <div className="container">
            <h2>Contáctanos</h2>
            <div className="grid-2">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h3>Soporte a la Comunidad</h3>
              <p>soporte@bibliotecaedumax.com</p>
              <h3>Síguenos en Instagram</h3>
              <a
                href="https://www.instagram.com/edumax_org/"
                target="_blank"
                rel="noopener noreferrer"
                className="insta-link"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
                >
              <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10z" />
              <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zM17.5 6.5a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                edumax_org
              </a>
              <img src={logo} width={400} alt="" />
            </div>

          <div className="card contact-card">
            <form
              onSubmit={(e) => {
                  e.preventDefault();
                  alert("Gracias, mensaje enviado (simulado).");
                }}
              >
                <label>Nombre</label>
                <input className="input" placeholder="Tu nombre" required />
                <label>Correo</label>
                <input className="input" placeholder="tu@email.com" type="email" required />
                <label>Asunto</label>
                <select className="select">
                  <option>Soporte Técnico</option>
                  <option>Solicitud de Recursos</option>
                  <option>Colaboración Académica</option>
                  <option>Otros</option>
                </select>
                <label>Mensaje</label>
                <textarea className="textarea" rows="4" required />
                <button className="btn-primary" type="submit">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h4 className="brand">Edumax</h4>
            <p className="muted">© {new Date().getFullYear()} Edumax. Todos los derechos reservados. Developed by Gimsper</p>
          </div>
          <div>
            <h4>Categorías</h4>
            <ul className="plain-list">
              <li>Matemáticas</li>
              <li>Literatura</li>
              <li>Ciencias</li>
            </ul>
          </div>
          <div>
            <h4>Soporte</h4>
            <ul className="plain-list">
              <li>Centro de Ayuda</li>
              <li>Guía de Usuario</li>
            </ul>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{authMode === "login" ? "Iniciar sesión" : "Registrarse"}</h3>
              <button className="btn-ghost" onClick={() => setShowAuthModal(false)}>
                ✖
              </button>
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="input"
                  required
                />
                <label>Contraseña</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="input"
                  required
                />
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setAuthMode("register")}
                  >
                    ¿No tienes cuenta? Regístrate
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y">
                <label>Nombre completo</label>
                <input
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="input"
                  required
                />
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="input"
                  required
                />
                <label>Contraseña</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="input"
                  required
                />
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className="input"
                  required
                />
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    Registrarse
                  </button>
                  <button type="button" className="btn-outline" onClick={() => setAuthMode("login")}>
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Subir Material Educativo</h3>
              <button className="btn-ghost" onClick={() => setShowUploadModal(false)}>
                ✖
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y">
              <label>Título del material</label>
              <input
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className="input"
                placeholder="Ej: Manual de Física Cuántica"
                required
              />

              <label>Descripción</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                className="textarea"
                rows="3"
                placeholder="Describe el contenido..."
                required
              />

              <label>Categoría</label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                className="select"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories
                  .filter((c) => c !== "All")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>

              <label>Archivo (PDF, DOC, DOCX, EPUB)</label>
              <input type="file" onChange={onFileInputChange} accept=".pdf,.doc,.docx,.epub" className="input" required />
              {uploadForm.file && <div className="muted">Archivo seleccionado: {uploadForm.file.name}</div>}

              <div className="modal-actions">
                <button className="btn-primary" type="submit">
                  Subir Material
                </button>
                <button type="button" className="btn-outline" onClick={() => setShowUploadModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { App }