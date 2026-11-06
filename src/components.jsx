import { NavLink } from 'react-router-dom'
import { Wind, LayoutDashboard, Map, BrainCircuit, HardHat, ChartNoAxesCombined, Globe2, Cpu, Info, House, Menu, Search, Bell, CircleHelp, ChevronDown, Activity, ArrowUpRight, ShieldCheck, Flag } from 'lucide-react'

const navGroups = [
  { label: 'WORKSPACE', items: [
    { to: '/', label: 'Home', icon: House, end: true },
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/routes', label: 'Clean Routes', icon: Map },
    { to: '/assistant', label: 'AI Assistant', icon: BrainCircuit },
    { to: '/your-reco', label: 'Your RECO', icon: Wind },
    { to: '/my-reco', label: 'My RECO device', icon: HardHat },
  ]},
  { label: 'INSIGHTS', items: [
    { to: '/community', label: 'Report Issue', icon: Flag },
    { to: '/analytics', label: 'Exposure Analytics', icon: ChartNoAxesCombined },
    { to: '/environment', label: 'Environment', icon: Globe2 },
  ]},
  { label: 'DISCOVER', items: [
    { to: '/technology', label: 'RECO Technology', icon: Cpu },
    { to: '/about', label: 'About RECO', icon: Info },
  ]},
]

export function AppLayout({ children }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Wind size={21}/></div><div><div className="brand-name">RECO <span>AI</span></div><div className="brand-caption">CLEAN AIR INTELLIGENCE</div></div></div>
      <div className="workspace-pill"><span className="status-dot"/> HACKATHON WORKSPACE <ChevronDown size={13}/></div>
      <nav className="side-nav">
        {navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><item.icon size={17}/><span>{item.label}</span>{item.label === 'AI Assistant' && <span className="nav-new">AI</span>}</NavLink>)}</div>)}
      </nav>
      <div className="sidebar-bottom"><div className="side-help"><CircleHelp size={17}/><span>Project help</span><ArrowUpRight size={14}/></div><div className="profile-mini"><div className="avatar">R</div><div className="profile-text"><strong>RECO Project</strong><span>Prototype workspace</span></div><ChevronDown size={15}/></div></div>
    </aside>
    <div className="main-column">
      <header className="topbar"><div className="mobile-brand"><div className="brand-mark"><Wind size={18}/></div><strong>RECO <span>AI</span></strong></div><div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Environmental intelligence</strong></div><div className="top-actions"><div className="system-status"><span className="status-dot"/> <span>GITHUB PAGES DEMO</span></div><button className="icon-button" aria-label="Search"><Search size={17}/></button><button className="icon-button" aria-label="Notifications"><Bell size={17}/></button><div className="top-avatar">R</div></div></header>
      <main className="page-content">{children}</main>
      <footer className="app-footer"><span>© 2026 RECO AI · Hackathon prototype</span><span><ShieldCheck size={13}/> Data-aware. Prototype-labelled. Built for better decisions.</span></footer>
    </div>
  </div>
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-header-actions">{actions}</div>}</div>
}

export function StatCard({ label, value, unit, change, icon: Icon, tone = 'cyan', footnote }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}>{Icon && <Icon size={18}/>}</div></div><div className="stat-value">{value}<small>{unit}</small></div>{change && <div className="stat-change">{change}</div>}{footnote && <div className="stat-footnote">{footnote}</div>}</div>
}

export function Panel({ title, subtitle, action, children, className = '' }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>
}

export function Notice({ tone = 'info', children }) { return <div className={`notice ${tone}`}>{children}</div> }
export function Loading({ label = 'Loading data...' }) { return <div className="loading-state"><span className="loader"/>{label}</div> }
export function ErrorState({ message, onRetry }) { return <div className="error-state"><strong>We couldn't load this data.</strong><span>{message}</span>{onRetry && <button className="button button-secondary button-small" onClick={onRetry}>Try again</button>}</div> }
export function EmptyState({ icon: Icon = Activity, title, text }) { return <div className="empty-state"><Icon size={26}/><strong>{title}</strong><span>{text}</span></div> }
