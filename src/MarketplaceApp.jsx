import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Figma,
  Filter,
  Globe2,
  Heart,
  LayoutGrid,
  LogOut,
  MessageCircle,
  PenTool,
  Plus,
  Search,
  Send,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { api, getToken, setToken } from "./api.js";

const categories = [
  { name: "All projects", icon: LayoutGrid },
  { name: "Design & creative", icon: PenTool },
  { name: "Development", icon: Code2 },
  { name: "Writing & content", icon: Figma },
  { name: "Marketing", icon: Sparkles },
  { name: "Business", icon: BriefcaseBusiness },
];

const sampleProjects = [
  {
    _id: "p1",
    isSample: true,
    featured: true,
    title: "Brand identity for a new-generation coffee house",
    description:
      "We are opening our first neighborhood coffee house and need a brand that feels warm, considered, and a little unexpected. Think tactile packaging, a memorable wordmark, and a flexible visual system.",
    category: "Design & creative",
    skills: ["Brand identity", "Logo design", "Packaging"],
    budget: 1800,
    budgetType: "Fixed price",
    duration: "2–3 weeks",
    postedAt: "2 hours ago",
    client: "Maya Chen",
    company: "Good Measure Coffee",
    location: "Brooklyn, NY",
    rating: 4.9,
    reviews: 18,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=640&h=400&fit=crop",
  },
  {
    _id: "p2",
    isSample: true,
    title: "Build a clean, fast storefront in Shopify",
    description:
      "Bring our small-batch homeware shop online. Designs are ready in Figma; we need a responsive theme, product setup, and a smooth checkout experience.",
    category: "Development",
    skills: ["Shopify", "Liquid", "Frontend"],
    budget: 3200,
    budgetType: "Fixed price",
    duration: "3–4 weeks",
    postedAt: "5 hours ago",
    client: "Theo Martin",
    company: "Form & Field",
    location: "London, UK",
    rating: 5,
    reviews: 11,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces",
    image:
      "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=640&h=400&fit=crop",
  },
  {
    _id: "p3",
    isSample: true,
    title: "Write a series of thoughtful product stories",
    description:
      "Help tell the story behind six everyday objects in a voice that is clear, human, and never too precious.",
    category: "Writing & content",
    skills: ["Copywriting", "Storytelling", "SEO"],
    budget: 950,
    budgetType: "Fixed price",
    duration: "1–2 weeks",
    postedAt: "Yesterday",
    client: "Sofia Patel",
    company: "Common Ground Goods",
    location: "Remote",
    rating: 4.8,
    reviews: 26,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=96&h=96&fit=crop&crop=faces",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=640&h=400&fit=crop",
  },
  {
    _id: "p4",
    isSample: true,
    title: "Create a launch campaign for a mindful skincare line",
    description:
      "Shape our first botanical skincare campaign across social, email, and a small creator collaboration program.",
    category: "Marketing",
    skills: ["Social media", "Campaign strategy", "Email"],
    budget: 2400,
    budgetType: "Fixed price",
    duration: "4–6 weeks",
    postedAt: "Yesterday",
    client: "Elena Rossi",
    company: "Soft Ritual",
    location: "Remote",
    rating: 4.9,
    reviews: 9,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=96&h=96&fit=crop&crop=faces",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=640&h=400&fit=crop",
  },
];

const money = (amount) => `$${Number(amount || 0).toLocaleString("en-US")}`;
const isSample = (project) =>
  project.isSample || String(project._id).startsWith("p");

function Modal({ title, onClose, children, className = "" }) {
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={`app-dialog ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="app-dialog-head">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function AuthForm({ onComplete, onCancel }) {
  const [mode, setMode] = useState("register");
  const [role, setRole] = useState("freelancer");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api(`/auth/${mode}`, {
        method: "POST",
        body: { ...form, role },
      });
      setToken(result.token);
      onComplete(result.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={mode === "register" ? "Create your account" : "Welcome back"}
      onClose={onCancel}
      className="form-dialog"
    >
      <form className="form-stack" onSubmit={submit}>
        {mode === "register" && (
          <>
            <label>
              Your name
              <input
                required
                maxLength="80"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                autoComplete="name"
              />
            </label>
            <div className="role-choice">
              <span>I’m joining as</span>
              <div>
                <button
                  type="button"
                  className={role === "freelancer" ? "selected" : ""}
                  onClick={() => setRole("freelancer")}
                >
                  Freelancer
                </button>
                <button
                  type="button"
                  className={role === "client" ? "selected" : ""}
                  onClick={() => setRole("client")}
                >
                  Client
                </button>
              </div>
            </div>
          </>
        )}
        <label>
          Email address
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            minLength="8"
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
          <small>At least 8 characters</small>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "register"
              ? "Create account"
              : "Sign in"}{" "}
          <ArrowRight size={16} />
        </button>
        <p className="form-switch">
          {mode === "register"
            ? "Already have an account?"
            : "New to WorkSphere?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "register" ? "login" : "register");
              setError("");
            }}
          >
            {mode === "register" ? "Sign in" : "Create an account"}
          </button>
        </p>
      </form>
    </Modal>
  );
}

function ProjectCard({ project, saved, onSave, onOpen, proposalStatus }) {
  return (
    <article
      className={`project-card${project.featured ? " project-card-featured" : ""}`}
    >
      <div className="project-card-topline">
        <div className="client-meta">
          <img
            className="client-avatar"
            src={
              project.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client || "Client")}&background=e1f2e9&color=315b42`
            }
            alt=""
          />
          <div>
            <span className="client-name">
              {project.client || project.owner?.name || "Independent client"}
            </span>
            <span className="client-company">
              {project.company || project.owner?.company || "Client"}
            </span>
          </div>
          {project.verified && (
            <span className="verified-mark" title="Verified client">
              <Check size={11} strokeWidth={3} />
            </span>
          )}
        </div>
        <button
          className={`icon-button save-button${saved ? " is-saved" : ""}`}
          onClick={() => onSave(project)}
          aria-label={saved ? "Remove saved project" : "Save project"}
          title={saved ? "Remove saved project" : "Save project"}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <button className="project-title-button" onClick={() => onOpen(project)}>
        <h3>{project.title}</h3>
        <ArrowRight size={17} />
      </button>
      <p className="project-description">{project.description}</p>
      <div className="project-skills">
        {(project.skills || []).map((skill) => (
          <span className="skill-tag" key={skill}>
            {skill}
          </span>
        ))}
      </div>
      <div className="project-footer">
        <div className="project-facts">
          <span className="budget">
            <strong>{money(project.budget)}</strong>{" "}
            <span>{project.budgetType || "Fixed price"}</span>
          </span>
          <span>
            <Clock3 size={14} /> {project.duration || "Flexible"}
          </span>
          <span>
            <Globe2 size={14} /> {project.location || "Remote"}
          </span>
        </div>
        <span className="posted-at">
          {proposalStatus
            ? `Applied · ${proposalStatus}`
            : project.postedAt || "Recently"}
        </span>
      </div>
    </article>
  );
}

function ProjectForm({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Design & creative",
    skills: "",
    budget: "",
    budgetType: "Fixed price",
    duration: "",
    location: "Remote",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onCreate({
        ...form,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        budget: Number(form.budget),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Post a project" onClose={onClose} className="form-dialog">
      <form className="form-stack" onSubmit={submit}>
        <label>
          Project title
          <input
            required
            minLength="8"
            maxLength="120"
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            placeholder="What do you need help with?"
          />
        </label>
        <label>
          Category
          <select
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value })
            }
          >
            {categories.slice(1).map((category) => (
              <option key={category.name}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          Description
          <textarea
            required
            minLength="30"
            maxLength="3000"
            rows="5"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Share the goals, deliverables, and context."
          />
        </label>
        <label>
          Skills, separated by commas
          <input
            value={form.skills}
            onChange={(event) =>
              setForm({ ...form, skills: event.target.value })
            }
            placeholder="e.g. Figma, brand strategy"
          />
        </label>
        <div className="form-grid">
          <label>
            Budget (USD)
            <input
              required
              type="number"
              min="1"
              value={form.budget}
              onChange={(event) =>
                setForm({ ...form, budget: event.target.value })
              }
            />
          </label>
          <label>
            Payment type
            <select
              value={form.budgetType}
              onChange={(event) =>
                setForm({ ...form, budgetType: event.target.value })
              }
            >
              <option>Fixed price</option>
              <option>Hourly</option>
            </select>
          </label>
        </div>
        <div className="form-grid">
          <label>
            Timeline
            <input
              required
              value={form.duration}
              onChange={(event) =>
                setForm({ ...form, duration: event.target.value })
              }
              placeholder="e.g. 2–3 weeks"
            />
          </label>
          <label>
            Location
            <input
              value={form.location}
              onChange={(event) =>
                setForm({ ...form, location: event.target.value })
              }
            />
          </label>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button" disabled={busy}>
          {busy ? "Publishing…" : "Publish project"} <ArrowRight size={16} />
        </button>
      </form>
    </Modal>
  );
}

function ProjectDetails({
  project,
  user,
  proposalSent,
  onClose,
  onApply,
  onSignIn,
}) {
  if (!project) return null;
  return (
    <Modal title="Project details" onClose={onClose} className="details-dialog">
      <div className="dialog-content">
        <div className="dialog-category">
          {project.category} <span>·</span> {project.postedAt || "Recently"}
        </div>
        <h2>{project.title}</h2>
        <div className="dialog-client">
          <img
            className="client-avatar"
            src={
              project.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(project.client || "Client")}`
            }
            alt=""
          />
          <div>
            <strong>{project.client || project.owner?.name}</strong>
            <span>
              {project.company || project.owner?.company || "Client"} ·{" "}
              {project.location || "Remote"}
            </span>
          </div>
          <span className="rating">
            {project.rating ? `★ ${project.rating}` : "New client"}{" "}
            {project.reviews ? <small>({project.reviews})</small> : null}
          </span>
        </div>
        <p>{project.description}</p>
        <div className="dialog-details">
          <div>
            <span>Project budget</span>
            <strong>
              {money(project.budget)}{" "}
              <small>{project.budgetType || "Fixed price"}</small>
            </strong>
          </div>
          <div>
            <span>Estimated timeline</span>
            <strong>{project.duration || "Flexible"}</strong>
          </div>
        </div>
        <div className="project-skills">
          {(project.skills || []).map((skill) => (
            <span className="skill-tag" key={skill}>
              {skill}
            </span>
          ))}
        </div>
        {proposalSent ? (
          <div className="inline-success">
            <Check size={16} /> Your proposal is submitted.
          </div>
        ) : isSample(project) ? (
          <p className="sample-notice">
            Sample listing: apply to projects posted by members.
          </p>
        ) : user?.role === "client" ? (
          <p className="sample-notice">
            Client accounts can browse projects but cannot apply.
          </p>
        ) : (
          <button
            className="primary-button dialog-apply"
            onClick={() => (user ? onApply(project) : onSignIn())}
          >
            <Send size={16} /> Send a proposal
          </button>
        )}
      </div>
    </Modal>
  );
}

function ProposalForm({ project, onClose, onSubmit }) {
  const [form, setForm] = useState({
    coverLetter: "",
    bid: String(project.budget || ""),
    duration: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit({ ...form, bid: Number(form.bid) });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Send a proposal" onClose={onClose} className="form-dialog">
      <form className="form-stack" onSubmit={submit}>
        <div className="form-context">
          <span>PROJECT</span>
          <strong>{project.title}</strong>
        </div>
        <label>
          Your proposal
          <textarea
            required
            minLength="30"
            maxLength="2500"
            rows="6"
            value={form.coverLetter}
            onChange={(event) =>
              setForm({ ...form, coverLetter: event.target.value })
            }
            placeholder="Tell the client how you would approach this project."
          />
        </label>
        <div className="form-grid">
          <label>
            Your bid (USD)
            <input
              required
              type="number"
              min="1"
              value={form.bid}
              onChange={(event) =>
                setForm({ ...form, bid: event.target.value })
              }
            />
          </label>
          <label>
            Timeline
            <input
              required
              value={form.duration}
              onChange={(event) =>
                setForm({ ...form, duration: event.target.value })
              }
              placeholder="e.g. 2 weeks"
            />
          </label>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button" disabled={busy}>
          {busy ? "Sending…" : "Submit proposal"} <Send size={15} />
        </button>
      </form>
    </Modal>
  );
}

function ProjectsView({
  projects,
  saved,
  user,
  onSave,
  onOpen,
  search,
  setSearch,
  category,
  setCategory,
  showSaved,
  setShowSaved,
  sort,
  setSort,
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  proposalMap,
  onSignIn,
}) {
  const visible = useMemo(
    () =>
      projects
        .filter((project) => {
          const text =
            `${project.title} ${project.description} ${(project.skills || []).join(" ")} ${project.company || ""}`.toLowerCase();
          return (
            (category === "All projects" || project.category === category) &&
            (!showSaved || saved.has(String(project._id))) &&
            (!search || text.includes(search.toLowerCase().trim())) &&
            (!minBudget || Number(project.budget) >= Number(minBudget)) &&
            (!maxBudget || Number(project.budget) <= Number(maxBudget))
          );
        })
        .sort((first, second) =>
          sort === "Budget: high to low"
            ? second.budget - first.budget
            : sort === "Budget: low to high"
              ? first.budget - second.budget
              : 0,
        ),
    [projects, category, saved, showSaved, search, minBudget, maxBudget, sort],
  );
  const categoryNav = (
    <>
      <div className="sidebar-heading">
        <span>Explore</span>
        <span className="sidebar-dot" />
      </div>
      <nav className="category-nav" aria-label="Project categories">
        {categories.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={`category-link${category === name && !showSaved ? " active" : ""}`}
            onClick={() => {
              setCategory(name);
              setShowSaved(false);
            }}
          >
            <Icon size={17} />
            <span>{name}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-divider" />
      <button
        className={`saved-link${showSaved ? " active" : ""}`}
        onClick={() => setShowSaved(!showSaved)}
      >
        <Heart size={17} />
        <span>Saved projects</span>
        <small>{saved.size || ""}</small>
      </button>
      <div className="sidebar-divider" />
      <div className="budget-filter">
        <div className="filter-label">
          <span>Project budget</span>
          <ChevronDown size={15} />
        </div>
        <div className="budget-inputs">
          <label>
            <span>$</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minBudget}
              onChange={(event) => setMinBudget(event.target.value)}
              aria-label="Minimum budget"
            />
          </label>
          <span className="budget-dash">–</span>
          <label>
            <span>$</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxBudget}
              onChange={(event) => setMaxBudget(event.target.value)}
              aria-label="Maximum budget"
            />
          </label>
        </div>
      </div>
      <button
        className="sidebar-post"
        onClick={
          user?.role === "client"
            ? () => document.dispatchEvent(new Event("open-post-form"))
            : onSignIn
        }
      >
        <Plus size={15} /> Post a project
      </button>
    </>
  );
  return (
    <section className="market-layout" id="projects">
      <aside className="sidebar">{categoryNav}</aside>
      <div className="project-area">
        <div className="search-row">
          <label className="search-box">
            <Search size={19} />
            <input
              placeholder="Search projects, skills, or clients"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search projects"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </label>
        </div>
        <div className="mobile-market-filters">
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setShowSaved(false);
            }}
            aria-label="Filter category"
          >
            {categories.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
          <button
            className={showSaved ? "selected" : ""}
            onClick={() => setShowSaved(!showSaved)}
          >
            <Heart size={14} /> Saved
          </button>
          <label>
            <span>$</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minBudget}
              onChange={(event) => setMinBudget(event.target.value)}
              aria-label="Minimum project budget"
            />
          </label>
          <label>
            <span>$</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxBudget}
              onChange={(event) => setMaxBudget(event.target.value)}
              aria-label="Maximum project budget"
            />
          </label>
        </div>
        <div className="results-heading">
          <div>
            <div className="section-kicker">
              FRESH PROJECTS FROM THE COMMUNITY
            </div>
            <h2>
              {showSaved
                ? "Saved projects"
                : category === "All projects"
                  ? "Projects worth a look"
                  : category}
              <span className="result-count">{visible.length}</span>
            </h2>
            <p>Find a project that fits the way you work.</p>
          </div>
        </div>
        <div className="list-toolbar">
          <div className="toolbar-left">
            <span className="live-dot" />
            <span>{visible.length} projects</span>
          </div>
          <label className="sort-control">
            <ArrowDownUp size={15} />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort projects"
            >
              <option>Newest first</option>
              <option>Budget: high to low</option>
              <option>Budget: low to high</option>
            </select>
            <ChevronDown size={14} />
          </label>
        </div>
        <div className="project-list">
          {visible.length ? (
            visible.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                saved={saved.has(String(project._id))}
                onSave={onSave}
                onOpen={onOpen}
                proposalStatus={proposalMap[String(project._id)]}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Filter size={22} />
              </div>
              <h3>No projects match these filters</h3>
              <p>Try another search or reset the filters.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All projects");
                  setShowSaved(false);
                  setMinBudget("");
                  setMaxBudget("");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
      <aside className="right-rail">
        <div className="rail-feature">
          <div className="rail-feature-image" />
          <div className="rail-feature-content">
            <span className="rail-label">A NOTE FROM THE COMMUNITY</span>
            <h3>Make space for work that matters.</h3>
            <p>
              Create your profile, meet thoughtful clients, and find good work.
            </p>
            <button
              onClick={
                user
                  ? () => document.dispatchEvent(new Event("open-profile"))
                  : onSignIn
              }
            >
              {user ? "Edit your profile" : "Join the community"}{" "}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <div className="rail-note">
          <span className="note-mark">“</span>
          <p>
            The best work happens when everyone gets to bring their whole self.
          </p>
          <span className="note-byline">A little reminder from us to you</span>
        </div>
      </aside>
    </section>
  );
}

function TalentView({ user, ownProjects, onInvite, onSignIn }) {
  const [talent, setTalent] = useState([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const refresh = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await api(
        `/users?role=freelancer${query ? `&search=${encodeURIComponent(query)}` : ""}`,
      );
      setTalent(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    refresh();
  }, [query]);
  return (
    <section className="content-view">
      <div className="view-heading">
        <div>
          <div className="section-kicker">MEET INDEPENDENT CREATIVES</div>
          <h1>Find your next collaborator</h1>
          <p>
            Explore profiles and invite someone to one of your open projects.
          </p>
        </div>
        <UsersRound size={28} />
      </div>
      <label className="search-box talent-search">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, skill, or location"
          aria-label="Search talent"
        />
      </label>
      {error && <p className="inline-error">{error}</p>}
      {busy ? (
        <div className="loading-state">Loading talent…</div>
      ) : talent.length ? (
        <div className="talent-grid">
          {talent.map((person) => (
            <article className="talent-card" key={person._id}>
              <img
                className="talent-avatar"
                src={
                  person.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=e1f2e9&color=315b42`
                }
                alt=""
              />
              <div className="talent-card-heading">
                <div>
                  <h2>{person.name}</h2>
                  <span>{person.location || "Location not set"}</span>
                </div>
                <span className="profile-role">Freelancer</span>
              </div>
              <p>
                {person.bio || "This freelancer is setting up their profile."}
              </p>
              <div className="project-skills">
                {(person.skills || []).slice(0, 6).map((skill) => (
                  <span className="skill-tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
              {user?.role === "client" ? (
                <button
                  className="secondary-button"
                  onClick={() => onInvite(person)}
                >
                  <Send size={14} /> Invite to a project
                </button>
              ) : (
                <button className="secondary-button" onClick={onSignIn}>
                  <MessageCircle size={14} /> Sign in to connect
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <UsersRound size={22} />
          </div>
          <h3>No freelancer profiles yet</h3>
          <p>
            Once freelancers join and publish their profiles, you’ll find them
            here.
          </p>
          <button onClick={onSignIn}>Create a freelancer profile</button>
        </div>
      )}
    </section>
  );
}

function DashboardView({ user, onOpenProfile, onMessage, onProjectUpdated }) {
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [activeProject, setActiveProject] = useState("");
  const [received, setReceived] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const refresh = async () => {
    setBusy(true);
    setError("");
    try {
      if (user.role === "client") setProjects(await api("/projects/mine"));
      else setProposals(await api("/proposals/mine"));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    refresh();
  }, [user._id]);
  const chooseProject = async (project) => {
    setActiveProject(project._id);
    try {
      setReceived(await api(`/projects/${project._id}/proposals`));
    } catch (err) {
      setError(err.message);
    }
  };
  const reviewProposal = async (proposal, status) => {
    try {
      await api(`/proposals/${proposal._id}/status`, {
        method: "PATCH",
        body: { status },
      });
      await chooseProject(
        projects.find((project) => project._id === activeProject),
      );
    } catch (err) {
      setError(err.message);
    }
  };
  const updateStatus = async (project, status) => {
    try {
      await api(`/projects/${project._id}/status`, {
        method: "PATCH",
        body: { status },
      });
      await refresh();
      if (activeProject === project._id) await chooseProject(project);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <section className="content-view">
      <div className="view-heading">
        <div>
          <div className="section-kicker">YOUR WORKSPACE</div>
          <h1>
            {user.role === "client" ? "Manage your projects" : "Your proposals"}
          </h1>
          <p>
            {user.role === "client"
              ? "Keep projects moving and find the right people."
              : "Track applications and hear back from clients."}
          </p>
        </div>
        <button className="secondary-button" onClick={onOpenProfile}>
          <Settings2 size={15} /> Edit profile
        </button>
      </div>
      {error && <p className="inline-error">{error}</p>}
      {busy ? (
        <div className="loading-state">Loading your workspace…</div>
      ) : user.role === "client" ? (
        <div className="dashboard-columns">
          <div className="dashboard-list">
            <div className="list-section-heading">
              <strong>Your projects</strong>
              <span>{projects.length}</span>
            </div>
            {projects.length ? (
              projects.map((project) => (
                <div
                  className={`dashboard-project${activeProject === project._id ? " selected" : ""}`}
                  key={project._id}
                >
                  <button
                    className="dashboard-project-select"
                    onClick={() => chooseProject(project)}
                  >
                    <strong>{project.title}</strong>
                    <small>{project.category} · {money(project.budget)}</small>
                  </button>
                  <select
                    className={`status-pill status-${project.status}`}
                    value={project.status}
                    onChange={(event) => updateStatus(project, event.target.value)}
                    aria-label={`Change status for ${project.title}`}
                  >
                    <option value="open">Open</option>
                    <option value="paused">Paused</option>
                    <option value="filled">Filled</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              ))
            ) : (
              <div className="empty-dashboard">
                <BriefcaseBusiness size={21} />
                <strong>No projects posted</strong>
                <span>Post a project to start receiving proposals.</span>
              </div>
            )}
          </div>
          <div className="proposal-panel">
            <div className="list-section-heading">
              <strong>
                {activeProject ? "Proposals received" : "Select a project"}
              </strong>
              <span>{received.length}</span>
            </div>
            {activeProject &&
              (received.length ? (
                received.map((proposal) => (
                  <article className="proposal-card" key={proposal._id}>
                    <div className="proposal-person">
                      <img
                        className="client-avatar"
                        src={
                          proposal.freelancer?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(proposal.freelancer?.name || "Freelancer")}`
                        }
                        alt=""
                      />
                      <div>
                        <strong>{proposal.freelancer?.name}</strong>
                        <span>
                          {proposal.freelancer?.location ||
                            "Independent freelancer"}
                        </span>
                      </div>
                      <span className={`status-pill status-${proposal.status}`}>
                        {proposal.status}
                      </span>
                    </div>
                    <p>{proposal.coverLetter}</p>
                    <div className="proposal-meta">
                      <strong>{money(proposal.bid)}</strong>
                      <span>{proposal.duration}</span>
                    </div>
                    <div className="project-skills">
                      {(proposal.freelancer?.skills || []).map((skill) => (
                        <span className="skill-tag" key={skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="proposal-actions">
                      {proposal.status === "pending" ? (
                        <>
                          <button
                            className="secondary-button"
                            onClick={() => reviewProposal(proposal, "declined")}
                          >
                            Decline
                          </button>
                          <button
                            className="primary-button small-primary"
                            onClick={() => reviewProposal(proposal, "accepted")}
                          >
                            Accept proposal
                          </button>
                        </>
                      ) : proposal.status === "accepted" ? (
                        <button
                          className="secondary-button"
                          onClick={() => onMessage(proposal)}
                        >
                          <MessageCircle size={14} /> Message freelancer
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-dashboard">
                  <MessageCircle size={21} />
                  <strong>No proposals yet</strong>
                  <span>New proposals for this project will appear here.</span>
                </div>
              ))}
          </div>
        </div>
      ) : proposals.length ? (
        <div className="proposal-list">
          {proposals.map((proposal) => (
            <article className="freelancer-proposal" key={proposal._id}>
              <div>
                <div className="section-kicker">
                  {proposal.project?.category}
                </div>
                <h2>{proposal.project?.title || "Project"}</h2>
                <p>{proposal.coverLetter}</p>
              </div>
              <div className="freelancer-proposal-meta">
                <strong>{money(proposal.bid)}</strong>
                <span>{proposal.duration}</span>
                <span className={`status-pill status-${proposal.status}`}>
                  {proposal.status}
                </span>
                {proposal.status === "accepted" && (
                  <button
                    className="secondary-button"
                    onClick={() => onMessage(proposal)}
                  >
                    <MessageCircle size={14} /> Message client
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Send size={22} />
          </div>
          <h3>No proposals sent yet</h3>
          <p>
            Browse open projects and send a proposal when you find a good fit.
          </p>
          <button onClick={onProjectUpdated}>Browse projects</button>
        </div>
      )}
    </section>
  );
}

function ProfileView({ user, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    company: user.company || "",
    skills: (user.skills || []).join(", "),
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave({
        ...form,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="content-view profile-view">
      <div className="view-heading">
        <div>
          <div className="section-kicker">YOUR PUBLIC PROFILE</div>
          <h1>Make a good introduction</h1>
          <p>Help people understand what you do and who you work best with.</p>
        </div>
        <UserRound size={27} />
      </div>
      <form className="profile-form form-stack" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Display name
            <input
              required
              maxLength="80"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </label>
          <label>
            Location
            <input
              value={form.location}
              onChange={(event) =>
                setForm({ ...form, location: event.target.value })
              }
              placeholder="City, country, or Remote"
            />
          </label>
        </div>
        {user.role === "client" && (
          <label>
            Company
            <input
              value={form.company}
              onChange={(event) =>
                setForm({ ...form, company: event.target.value })
              }
            />
          </label>
        )}
        <label>
          About you
          <textarea
            rows="5"
            maxLength="700"
            value={form.bio}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
            placeholder="Share your experience, approach, and the work you care about."
          />
        </label>
        {user.role === "freelancer" && (
          <label>
            Skills, separated by commas
            <input
              value={form.skills}
              onChange={(event) =>
                setForm({ ...form, skills: event.target.value })
              }
              placeholder="e.g. React, brand design, copywriting"
            />
          </label>
        )}
        {error && <p className="form-error">{error}</p>}
        <div className="profile-form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button" disabled={busy}>
            {busy ? "Saving…" : "Save profile"} <Check size={15} />
          </button>
        </div>
      </form>
    </section>
  );
}

function MessagesView({ user, selectedId, onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const refreshConversations = async () => {
    try {
      setConversations(await api("/conversations"));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    refreshConversations();
  }, []);
  useEffect(() => {
    if (!selectedId) return;
    api(`/conversations/${selectedId}/messages`)
      .then(setMessages)
      .catch((err) => setError(err.message));
  }, [selectedId]);
  const send = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    try {
      const message = await api(`/conversations/${selectedId}/messages`, {
        method: "POST",
        body: { text },
      });
      setMessages((items) => [
        ...items,
        { ...message, sender: { _id: user._id, name: user.name } },
      ]);
      setText("");
      refreshConversations();
    } catch (err) {
      setError(err.message);
    }
  };
  const selected = conversations.find((item) => item._id === selectedId);
  const other = selected?.participants?.find(
    (person) => String(person._id) !== String(user._id),
  );
  return (
    <section className="content-view messages-view">
      <div className="view-heading">
        <div>
          <div className="section-kicker">PRIVATE PROJECT CONVERSATIONS</div>
          <h1>Messages</h1>
          <p>Keep project conversations in one place.</p>
        </div>
        <MessageCircle size={27} />
      </div>
      <div className="messages-layout">
        <aside className="conversation-list">
          {busy ? (
            <div className="loading-state">Loading conversations…</div>
          ) : conversations.length ? (
            conversations.map((conversation) => {
              const participant = conversation.participants.find(
                (person) => person._id !== user._id,
              );
              const last = conversation.messages?.at(-1);
              return (
                <button
                  key={conversation._id}
                  className={`conversation-item${selectedId === conversation._id ? " selected" : ""}`}
                  onClick={() => onSelect(conversation._id)}
                >
                  <img
                    className="client-avatar"
                    src={
                      participant?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(participant?.name || "Member")}`
                    }
                    alt=""
                  />
                  <span>
                    <strong>{participant?.name || "Member"}</strong>
                    <small>
                      {conversation.project?.title || "Project conversation"}
                    </small>
                    <small className="conversation-preview">
                      {last?.text || "Start the conversation"}
                    </small>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="empty-dashboard">
              <MessageCircle size={20} />
              <strong>No conversations yet</strong>
              <span>
                Accept a proposal or invite a freelancer to start one.
              </span>
            </div>
          )}
        </aside>
        <div className="message-thread">
          {selected ? (
            <>
              <header className="thread-head">
                <div>
                  <strong>{other?.name || "Project member"}</strong>
                  <span>{selected.project?.title}</span>
                </div>
                <button
                  className="secondary-button"
                  onClick={() =>
                    api(`/conversations/${selectedId}/messages`).then(
                      setMessages,
                    )
                  }
                  aria-label="Refresh messages"
                >
                  Refresh
                </button>
              </header>
              <div className="thread-messages">
                {messages.map((message) => (
                  <article
                    className={`message-bubble${message.sender?._id === user._id || message.sender === user._id ? " own" : ""}`}
                    key={message._id}
                  >
                    <p>{message.text}</p>
                    <time>{new Date(message.createdAt).toLocaleString()}</time>
                  </article>
                ))}
              </div>
              <form className="message-composer" onSubmit={send}>
                <textarea
                  aria-label="Write a message"
                  rows="2"
                  maxLength="4000"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Write a message…"
                />
                <button
                  className="primary-button"
                  disabled={!text.trim()}
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="empty-thread">
              <MessageCircle size={28} />
              <strong>Choose a conversation</strong>
              <span>Project messages stay private between members.</span>
            </div>
          )}
        </div>
      </div>
      {error && <p className="inline-error">{error}</p>}
    </section>
  );
}

function InviteForm({ person, projects, onClose, onInvite }) {
  const [projectId, setProjectId] = useState(projects[0]?._id || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await onInvite(projectId);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={`Invite ${person.name}`}
      onClose={onClose}
      className="form-dialog"
    >
      <form className="form-stack" onSubmit={submit}>
        <p className="form-intro">
          Choose one of your projects to open a private conversation with this
          freelancer.
        </p>
        {projects.length ? (
          <label>
            Project
            <select
              required
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="sample-notice">
            Post an open project before inviting a freelancer.
          </p>
        )}
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" disabled={busy || !projects.length}>
          {busy ? "Opening…" : "Open conversation"} <MessageCircle size={15} />
        </button>
      </form>
    </Modal>
  );
}

export default function MarketplaceApp() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(Boolean(getToken()));
  const [projects, setProjects] = useState(sampleProjects);
  const [saved, setSaved] = useState(
    () => new Set(JSON.parse(localStorage.getItem("savedProjects") || "[]")),
  );
  const [view, setView] = useState("projects");
  const [category, setCategory] = useState("All projects");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest first");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [projectDialog, setProjectDialog] = useState(null);
  const [proposalProject, setProposalProject] = useState(null);
  const [invitePerson, setInvitePerson] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [messageId, setMessageId] = useState("");
  const [toast, setToast] = useState("");
  const [proposalMap, setProposalMap] = useState({});
  const notify = (message) => setToast(message);
  const loadProjects = async () => {
    try {
      const items = await api("/projects");
      if (Array.isArray(items) && items.length) setProjects(items);
    } catch {
      setProjects(sampleProjects);
    }
  };
  useEffect(() => {
    loadProjects();
  }, []);
  useEffect(() => {
    if (!getToken()) return;
    api("/auth/me")
      .then(({ user: account }) => {
        setUser(account);
        setSaved(new Set(account.savedProjects || []));
      })
      .catch(() => setToken(null))
      .finally(() => setLoadingUser(false));
  }, []);
  useEffect(() => {
    if (user?.role !== "client") {
      setMyProjects([]);
      return;
    }
    api("/projects/mine")
      .then(setMyProjects)
      .catch(() => setMyProjects([]));
  }, [user?._id, user?.role]);
  useEffect(() => {
    localStorage.setItem("savedProjects", JSON.stringify([...saved]));
  }, [saved]);
  useEffect(() => {
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const openPost = () =>
      user?.role === "client"
        ? setPostOpen(true)
        : notify("Sign in with a client account to post a project.");
    const openProfile = () => user && setView("profile");
    document.addEventListener("open-post-form", openPost);
    document.addEventListener("open-profile", openProfile);
    return () => {
      document.removeEventListener("open-post-form", openPost);
      document.removeEventListener("open-profile", openProfile);
    };
  }, [user]);

  const onAuthenticated = (account) => {
    setUser(account);
    setSaved(new Set(account.savedProjects || []));
    setAuthOpen(false);
    notify(`Welcome, ${account.name.split(" ")[0]}.`);
  };
  const signOut = () => {
    setToken(null);
    setUser(null);
    setSaved(
      new Set(JSON.parse(localStorage.getItem("savedProjects") || "[]")),
    );
    setView("projects");
    notify("You have signed out.");
  };
  const toggleSave = async (project) => {
    const id = String(project._id);
    const nextSaved = !saved.has(id);
    setSaved((current) => {
      const next = new Set(current);
      nextSaved ? next.add(id) : next.delete(id);
      return next;
    });
    if (user) {
      try {
        const result = await api("/auth/me/saved", {
          method: "PATCH",
          body: { projectId: id, saved: nextSaved },
        });
        setSaved(new Set(result.savedProjects));
      } catch (err) {
        notify(err.message);
      }
    }
  };
  const createProject = async (data) => {
    const project = await api("/projects", { method: "POST", body: data });
    setProjects((items) => [project, ...items]);
    setMyProjects((items) => [project, ...items]);
    setPostOpen(false);
    setView("dashboard");
    notify("Your project is live.");
  };
  const sendProposal = async (data) => {
    const proposal = await api(`/projects/${proposalProject._id}/proposals`, {
      method: "POST",
      body: data,
    });
    setProposalMap((current) => ({
      ...current,
      [proposalProject._id]: "pending",
    }));
    setProposalProject(null);
    setProjectDialog(null);
    notify("Your proposal was sent.");
  };
  const updateProfile = async (data) => {
    const result = await api("/auth/me", { method: "PUT", body: data });
    setUser(result.user);
    setView("projects");
    notify("Profile saved.");
  };
  const startProposalConversation = async (proposal) => {
    try {
      const result = await api(`/conversations/from-proposal/${proposal._id}`, {
        method: "POST",
        body: {},
      });
      setMessageId(result.conversationId);
      setView("messages");
    } catch (err) {
      notify(err.message);
    }
  };
  const inviteFreelancer = async (projectId) => {
    const result = await api("/conversations/invite", {
      method: "POST",
      body: { projectId, recipientId: invitePerson._id },
    });
    setInvitePerson(null);
    setMessageId(result.conversationId);
    setView("messages");
  };
  const navButton = (id, label, Icon) => (
    <button
      className={`nav-link${view === id ? " nav-current" : ""}`}
      onClick={() => {
        setView(id);
      }}
    >
      {Icon && <Icon size={15} />}
      {label}
    </button>
  );
  const beginPost = () => {
    if (!user) setAuthOpen(true);
    else if (user.role !== "client")
      notify("Project posting is available to client accounts.");
    else setPostOpen(true);
  };
  const beginSave = (project) => {
    if (!user) {
      notify("Sign in to save projects across devices.");
      setSaved((current) => {
        const next = new Set(current);
        next.has(String(project._id))
          ? next.delete(String(project._id))
          : next.add(String(project._id));
        return next;
      });
      return;
    }
    toggleSave(project);
  };

  if (loadingUser)
    return <div className="app-loading">Loading your workspace…</div>;
  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#top"
          onClick={() => setView("projects")}
          aria-label="WorkSphere home"
        >
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>
            Work<span className="brand-light">Sphere</span>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          {navButton("projects", "Find work", Search)}
          {navButton("talent", "Find talent", UsersRound)}
          {user && navButton("dashboard", "My workspace", BriefcaseBusiness)}
          {user && navButton("messages", "Messages", MessageCircle)}
        </nav>
        <div className="top-actions">
          {user ? (
            <>
              <button
                className="account-button"
                onClick={() => setView("profile")}
              >
                <UserRound size={15} />
                <span>{user.name.split(" ")[0]}</span>
              </button>
              <button
                className="icon-button logout-button"
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
              {user.role === "client" && (
                <button className="join-button" onClick={beginPost}>
                  <Plus size={15} /> Post a project
                </button>
              )}
            </>
          ) : (
            <>
              <button
                className="login-button"
                onClick={() => setAuthOpen(true)}
              >
                Log in
              </button>
              <button className="join-button" onClick={() => setAuthOpen(true)}>
                Join free <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </header>
      <main id="top">
        <section className="welcome-band">
          <div className="welcome-copy">
            <div className="eyebrow">
              <span /> A better kind of freelance marketplace
            </div>
            <h1>
              Find work that
              <br />
              <em>feels like you.</em>
            </h1>
            <p>
              Good projects start with good people. Find your next one here.
            </p>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="art-sun" />
            <div className="art-arch">
              <div className="art-arch-inner" />
              <span className="art-star">✳</span>
              <span className="art-caption">
                MAKE GOOD
                <br />
                THINGS HAPPEN
              </span>
            </div>
            <div className="art-blob" />
            <div className="art-spark">✦</div>
          </div>
          <div className="welcome-note">
            <span>Independent work,</span>
            <strong>with a little more heart.</strong>
          </div>
        </section>
        {view === "projects" && (
          <ProjectsView
            projects={projects}
            saved={saved}
            user={user}
            onSave={beginSave}
            onOpen={setProjectDialog}
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            showSaved={showSaved}
            setShowSaved={setShowSaved}
            sort={sort}
            setSort={setSort}
            minBudget={minBudget}
            setMinBudget={setMinBudget}
            maxBudget={maxBudget}
            setMaxBudget={setMaxBudget}
            proposalMap={proposalMap}
            onSignIn={() => setAuthOpen(true)}
          />
        )}
        {view === "talent" && (
          <TalentView
            user={user}
            ownProjects={myProjects}
            onInvite={setInvitePerson}
            onSignIn={() => setAuthOpen(true)}
          />
        )}
        {view === "dashboard" &&
          (user ? (
            <DashboardView
              user={user}
              onOpenProfile={() => setView("profile")}
              onMessage={startProposalConversation}
              onProjectUpdated={() => {
                setView("projects");
                loadProjects();
              }}
            />
          ) : (
            <SignInPrompt onSignIn={() => setAuthOpen(true)} />
          ))}
        {view === "profile" && user && (
          <ProfileView
            user={user}
            onSave={updateProfile}
            onCancel={() => setView("projects")}
          />
        )}
        {view === "messages" &&
          (user ? (
            <MessagesView
              user={user}
              selectedId={messageId}
              onSelect={setMessageId}
            />
          ) : (
            <SignInPrompt onSignIn={() => setAuthOpen(true)} />
          ))}
      </main>
      <footer className="site-footer">
        <span>© 2026 WorkSphere</span>
        <div>
          <button onClick={() => setView("projects")}>Find work</button>
          <button onClick={() => setView("talent")}>Find talent</button>
          {user && <button onClick={() => setView("dashboard")}>My workspace</button>}
        </div>
        <span>
          Made for the way you work <span className="footer-heart">♥</span>
        </span>
      </footer>
      {authOpen && (
        <AuthForm
          onComplete={onAuthenticated}
          onCancel={() => setAuthOpen(false)}
        />
      )}
      {postOpen && (
        <ProjectForm
          onClose={() => setPostOpen(false)}
          onCreate={createProject}
        />
      )}
      {projectDialog && (
        <ProjectDetails
          project={projectDialog}
          user={user}
          proposalSent={proposalMap[projectDialog._id]}
          onClose={() => setProjectDialog(null)}
          onApply={(project) => {
            if (user?.role !== "freelancer")
              return notify("Sign in with a freelancer account to apply.");
            setProposalProject(project);
          }}
          onSignIn={() => {
            setProjectDialog(null);
            setAuthOpen(true);
          }}
        />
      )}
      {proposalProject && (
        <ProposalForm
          project={proposalProject}
          onClose={() => setProposalProject(null)}
          onSubmit={sendProposal}
        />
      )}
      {invitePerson && (
        <InviteForm
          person={invitePerson}
          projects={myProjects.filter((project) => project.status === "open")}
          onClose={() => setInvitePerson(null)}
          onInvite={inviteFreelancer}
        />
      )}
      {toast && (
        <div className="toast-message" role="status">
          <Check size={16} />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function SignInPrompt({ onSignIn }) {
  return (
    <section className="content-view">
      <div className="empty-state">
        <div className="empty-icon">
          <UserRound size={22} />
        </div>
        <h3>Sign in to open your workspace</h3>
        <p>
          Manage projects, proposals, profiles, and conversations from one
          place.
        </p>
        <button onClick={onSignIn}>Sign in or join free</button>
      </div>
    </section>
  );
}
