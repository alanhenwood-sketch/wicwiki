import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Book, Settings, Upload, FileText, 
  Menu, X, ChevronRight, PenTool, Save, 
  Trash2, Database, Layout, Tag, Lock, Key, LogOut,
  Info, Sparkles, MessageSquare, Loader, Send, CheckCircle, AlertTriangle,
  Edit, Bold, Italic, List, Type, Underline, AlignLeft, Filter, Image as ImageIcon,
  Plus, StickyNote, Download, Copy, PenLine, Share2, Maximize2, Minimize2,
  Home, Library, PenSquare, FileInput, Sliders, Palette, Type as TypeIcon,
  ChevronLeft, ChevronsLeft, ChevronsRight, BarChart, Smartphone, ShieldCheck, ArrowLeft,
  Calendar, Megaphone, Clock, ExternalLink, Play, RefreshCw, Quote, MoreHorizontal,
  PauseCircle, PlayCircle, XCircle
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  onSnapshot,
  getDocs, 
  getDoc, 
  serverTimestamp,
  query,
  limit,
  orderBy,
  where,
  writeBatch
} from 'firebase/firestore';

// --- CONFIGURATION SECTION ---
// TODO: Replace this object with the one from your Firebase Console
const liveFirebaseConfig = {
  apiKey: "AIzaSyC45o7fJuF_akzIZ0eBo1UGGx78ZCnCEk4",
  authDomain: "wicwiki-24d11.firebaseapp.com",
  projectId: "wicwiki-24d11",
  storageBucket: "wicwiki-24d11.firebasestorage.app",
  messagingSenderId: "817508613146",
  appId: "1:817508613146:web:b3e2afa79e539ac75265a3"
};

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 font-sans text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="mb-4">Please check the console for details.</p>
          <pre className="bg-gray-100 p-4 rounded text-left overflow-auto text-sm text-red-800 border border-red-200">
            {this.state.error && this.state.error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- INITIALIZATION ---
let app, auth, db;
let initError = null;

try {
  const envConfig = (typeof window !== 'undefined' && window.__firebase_config) 
    ? JSON.parse(window.__firebase_config) 
    : null;
  const configToUse = envConfig || liveFirebaseConfig;

  if (configToUse.apiKey === "PASTE_YOUR_API_KEY_HERE") {
    initError = "CONFIGURATION_NEEDED";
  } else {
    app = initializeApp(configToUse);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase init failed:", e);
  initError = e.message;
}

const rawAppId = (typeof window !== 'undefined' && window.__app_id) ? window.__app_id : 'production-v1';
const appId = rawAppId.replace(/[\/\\#\?]/g, '_'); 

// --- Theme Config ---
const FONTS = { sans: "font-sans", serif: "font-serif", mono: "font-mono" };
const TEXT_SIZES = { sm: "text-sm", base: "text-base", lg: "text-lg" };
const COLORS = {
  indigo: { name: 'Indigo', text: 'text-indigo-600', bg: 'bg-indigo-600', bgSoft: 'bg-indigo-50', border: 'border-indigo-200', hoverText: 'hover:text-indigo-900', ring: 'focus:ring-indigo-500' },
  rose:   { name: 'Rose',   text: 'text-rose-600',   bg: 'bg-rose-600',   bgSoft: 'bg-rose-50',   border: 'border-rose-200',   hoverText: 'hover:text-rose-900',   ring: 'focus:ring-rose-500' },
  emerald:{ name: 'Emerald',text: 'text-emerald-600',bg: 'bg-emerald-600',bgSoft: 'bg-emerald-50',border: 'border-emerald-200',hoverText: 'hover:text-emerald-900',hoverBg: 'hover:bg-emerald-700', ring: 'focus:ring-emerald-500' },
  amber:  { name: 'Amber',  text: 'text-amber-600',  bg: 'bg-amber-600',  bgSoft: 'bg-amber-50',  border: 'border-amber-200',  hoverText: 'hover:text-amber-900',  ring: 'focus:ring-amber-500' },
  violet: { name: 'Violet', text: 'text-violet-600', bg: 'bg-violet-600', bgSoft: 'bg-violet-50', border: 'border-violet-200', hoverText: 'hover:text-violet-900', ring: 'focus:ring-violet-500' },
  slate:  { name: 'Slate',  text: 'text-slate-600',  bg: 'bg-slate-600',  bgSoft: 'bg-slate-50',  border: 'border-slate-200',  hoverText: 'hover:text-slate-900',  ring: 'focus:ring-slate-500' },
};
const TEXT_COLORS = { gray: "text-gray-600", slate: "text-slate-600", zinc: "text-zinc-600", neutral: "text-neutral-600" };

const INSPIRATIONAL_VERSES = [
  { text: "For God so loved the world...", ref: "John 3:16" },
  { text: "I can do all things through Christ...", ref: "Philippians 4:13" },
  { text: "The LORD is my shepherd...", ref: "Psalm 23:1" },
];

// --- Helper Functions ---
const makeId = (t) => t ? t.trim().replace(/\s+/g, '_').replace(/[^\w\-_]/g, '') : '';

// --- Components ---
const NavItem = ({ icon: Icon, label, active, onClick, theme }) => {
  const textCol = theme.colors.text;
  const bgCol = theme.colors.bgSoft;
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? `${bgCol} ${textCol}` : `text-gray-500 hover:bg-gray-50 hover:text-gray-900`}`} title={label}>
      <Icon size={18} className={active ? textCol : "text-gray-400"} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};
const Badge = ({ children, theme, onClick }) => (
  <span onClick={(e) => { if (onClick) { e.stopPropagation(); onClick(); } }} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${theme.colors.bgSoft} ${theme.colors.text} ${onClick ? 'cursor-pointer hover:opacity-80 hover:underline' : ''}`} title={onClick ? "View category" : ""}>{children}</span>
);

const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;
const ArticleSkeleton = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4"><Skeleton className="h-6 w-2/3 mb-2" /><Skeleton className="h-5 w-20" /></div>
    <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
  </div>
);

// --- Rich Text Editor ---
const RichTextEditor = ({ content, onChange, theme }) => {
  const editorRef = useRef(null);
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = content;
    }
  }, [content]);
  const exec = (cmd, val=null) => { document.execCommand(cmd, false, val); if (editorRef.current) onChange(editorRef.current.innerHTML); };
  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 ${theme.colors.ring} focus-within:border-transparent`}>
      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <button onClick={()=>exec('bold')} className="p-1 hover:bg-gray-200 rounded"><Bold size={16}/></button>
        <button onClick={()=>exec('italic')} className="p-1 hover:bg-gray-200 rounded"><Italic size={16}/></button>
        <button onClick={()=>exec('formatBlock','H3')} className="p-1 hover:bg-gray-200 rounded"><Type size={16}/></button>
      </div>
      <div ref={editorRef} contentEditable className={`min-h-[200px] p-4 outline-none prose prose-sm max-w-none ${theme.font}`} onInput={e => onChange(e.currentTarget.innerHTML)} />
    </div>
  );
};

// --- Verse Tooltip Component ---
const VerseTooltip = ({ reference, theme }) => {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleMouseEnter = async () => {
    if (text || loading || error) return;
    setLoading(true);
    try {
      const cleanRef = reference.replace(/\.$/, '').replace(/\s+/g, ' ');
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(cleanRef)}?translation=kjv`);
      const data = await res.json();
      if (data && data.text) setText(data.text); else setError(true);
    } catch (e) { setError(true); } finally { setLoading(false); }
  };

  return (
    <span className={`relative group cursor-help font-bold border-b-2 border-dotted inline-block ${theme.colors.text} border-indigo-200`} onMouseEnter={handleMouseEnter}>
      {reference}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900 text-white text-sm rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-left leading-normal">
        {loading && "Loading..."}
        {error && "Verse unavailable."}
        {text && <i>"{text.trim()}"</i>}
      </span>
    </span>
  );
};

// --- HTML Renderer ---
const HtmlContentRenderer = ({ html, theme, onNavigate }) => {
  const verseRegex = /(\b(?:(?:1|2|3|I|II)\s*)?(?:[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?(?:\s+[A-Za-z]+)?)(?:\.|(?:\s+))\s*\d+:\d+(?:[-–,]\s*\d+)*)/g;
  const isVerseString = (str) => /^(\b(?:(?:1|2|3|I|II)\s*)?(?:[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?(?:\s+[A-Za-z]+)?)(?:\.|(?:\s+))\s*\d+:\d+(?:[-–,]\s*\d+)*)$/.test(str);

  const renderNodes = (nodes) => Array.from(nodes).map((node, i) => {
      // Text Node
      if (node.nodeType === 3) {
        const text = node.textContent;
        if(!text.trim()) return null;
        const parts = text.split(verseRegex);
        return (
          <React.Fragment key={i}>
            {parts.map((part, index) => {
               if (isVerseString(part)) return <VerseTooltip key={index} reference={part} theme={theme} />;
               return <span key={index}>{part}</span>;
            })}
          </React.Fragment>
        );
      }
      
      // Element Node
      if (node.nodeType === 1) {
        const tagName = node.tagName.toLowerCase();
        if (['script','style'].includes(tagName)) return null;
        const props = { key: i };
        if (node.attributes) Array.from(node.attributes).forEach(attr => { if(/^[a-z0-9-]+$/.test(attr.name)) props[attr.name] = attr.value; });

        // Styling
        let baseClass = props.className || '';
        if (tagName === 'p') baseClass += ' mb-4 leading-relaxed text-gray-700';
        if (tagName === 'h1') baseClass += ' text-3xl font-bold mt-8 mb-4 text-gray-900';
        if (tagName === 'h2') baseClass += ' text-2xl font-bold mt-6 mb-3 text-gray-900 border-b pb-2 border-gray-200';
        if (tagName === 'h3') baseClass += ' text-xl font-bold mt-5 mb-2 text-gray-800';
        if (tagName === 'ul') baseClass += ' list-disc list-inside mb-4 ml-4 text-gray-700';
        if (tagName === 'ol') baseClass += ' list-decimal list-inside mb-4 ml-4 text-gray-700';
        if (tagName === 'li') baseClass += ' mb-1';
        if (tagName === 'blockquote') baseClass += ' border-l-4 border-indigo-200 pl-4 py-2 my-4 italic text-gray-600 bg-gray-50';
        props.className = baseClass;
        
        // Link Handlers
        if (props['data-wiki-link'] && onNavigate) {
          props.onClick = (e) => { e.preventDefault(); e.stopPropagation(); onNavigate(props['data-wiki-link']); };
          props.className += ` cursor-pointer ${theme.colors.text} hover:underline font-bold`;
        }
        if (props['data-wiki-anchor']) {
          props.onClick = (e) => { e.preventDefault(); e.stopPropagation(); const el = document.getElementById(props['data-wiki-anchor']); if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
          props.className += ` cursor-pointer ${theme.colors.text} hover:underline font-medium`;
        }
        return React.createElement(tagName, props, node.childNodes.length > 0 ? renderNodes(node.childNodes) : null);
      }
      return null;
  });
  try { return <>{renderNodes(new DOMParser().parseFromString(html || "", 'text/html').body.childNodes)}</>; } catch { return null; }
};

const VerseOfTheDayWidget = () => (
    <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-8 shadow-lg text-white mb-8">
       <div className="flex flex-col md:flex-row gap-6 items-center">
         <div className="flex-1 text-center md:text-left">
           <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-indigo-200 text-sm font-medium uppercase tracking-widest"><Sparkles size={14} className="text-yellow-400" /> Verse of the Day</div>
           <p className="text-xl font-serif italic mb-2">"For God so loved the world..."</p>
           <p className="font-sans font-bold text-yellow-400">John 3:16</p>
         </div>
       </div>
    </div>
);

const FloatingNotesWidget = ({ article, noteContent, onChange, onExport, onShare, visible, setVisible, theme }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  if (!visible || !article) return null;
  if (isMinimized) return (<button onClick={() => setIsMinimized(false)} className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-xl transition-all hover:scale-105 flex items-center gap-2 animate-fadeIn border-2 border-white text-white ${theme.colors.bg}`}><StickyNote size={24} /></button>);

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 rounded-2xl shadow-2xl border-2 flex flex-col animate-slideUp transition-all overflow-hidden h-96 bg-yellow-50 border-yellow-200`}>
       <div className={`flex items-center justify-between p-3 border-b bg-yellow-100/80 backdrop-blur-sm border-yellow-200`}>
         <div className="flex items-center gap-2 overflow-hidden"><StickyNote size={16} className="text-yellow-700" /><h4 className={`font-bold text-yellow-900 text-sm truncate w-40 ${theme.font}`}>{article.title}</h4></div>
         <div className="flex gap-1">
            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-yellow-200 rounded-lg text-yellow-800" title="Minimize"><Minimize2 size={14}/></button>
            <button onClick={() => setVisible(false)} className="p-1.5 hover:bg-yellow-200 rounded-lg text-yellow-800" title="Close"><X size={14}/></button>
         </div>
       </div>
       <textarea className={`flex-1 w-full bg-white/50 p-4 text-sm text-gray-800 leading-relaxed focus:outline-none resize-none font-medium placeholder-yellow-800/30 ${theme.font}`} placeholder="Jot down your thoughts here..." value={noteContent} onChange={(e) => onChange(article.id, e.target.value)} autoFocus></textarea>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  if (initError === "CONFIGURATION_NEEDED") {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
              <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-red-100 text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32}/></div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration Needed</h1>
                  <p className="text-gray-600 mb-6">Update <code>src/App.jsx</code> with your Firebase keys.</p>
              </div>
          </div>
      );
  }
  if (initError) throw new Error("Firebase Failed: " + initError);

  // --- State ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [previousView, setPreviousView] = useState('home'); 
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(50);
  
  // Settings
  const [siteTitle, setSiteTitle] = useState("Theologue");
  const [siteDescription, setSiteDescription] = useState("Welcome to the library.");
  const [siteColor, setSiteColor] = useState("indigo");
  const [siteTextColor, setSiteTextColor] = useState("gray");
  const [siteFont, setSiteFont] = useState("sans");
  const [siteTextSize, setSiteTextSize] = useState("base");
  const [imageSeed, setImageSeed] = useState(0);
  
  // Admin & Data
  const [adminTab, setAdminTab] = useState('manage');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState(""); // <--- FIXED: Added this missing state
  const [customSections, setCustomSections] = useState([]);
  const [dbCategoryCounts, setDbCategoryCounts] = useState({});
  const [notes, setNotes] = useState(() => { 
      try { return (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('theologue_notes')) || {} : {}; } 
      catch { return {}; } 
  });
  
  // UI States
  const [showNoteWidget, setShowNoteWidget] = useState(true);
  const [isWelcomeMinimized, setIsWelcomeMinimized] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('ai');
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [pendingScrollAnchor, setPendingScrollAnchor] = useState(null);

  // Editor States
  const [editingId, setEditingId] = useState(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorCategory, setEditorCategory] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [sectionContent, setSectionContent] = useState("");
  const [sectionPersistent, setSectionPersistent] = useState(false);
  const [sectionExpiry, setSectionExpiry] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [loginStep, setLoginStep] = useState('password');
  const [mfaInput, setMfaInput] = useState("");

  // Import Refs
  const pagesRef = useRef(null);
  const importCursorRef = useRef(0);
  const abortImportRef = useRef(false);
  const [importState, setImportState] = useState('idle');

  // Computed
  const currentTheme = useMemo(() => ({
    font: FONTS[siteFont] || FONTS.sans,
    textSize: TEXT_SIZES[siteTextSize] || TEXT_SIZES.base,
    colors: COLORS[siteColor] || COLORS.indigo,
    textColor: TEXT_COLORS[siteTextColor] || TEXT_COLORS.gray
  }), [siteColor, siteFont, siteTextSize, siteTextColor]);

  // --- Effects ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
       try {
         if (typeof window !== 'undefined' && window.__initial_auth_token) await signInWithCustomToken(auth, window.__initial_auth_token);
         else await signInAnonymously(auth);
       } catch (e) { console.error("Auth failed:", e); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    setIsLoading(true);
    const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
    let q = activeCategory 
        ? query(articlesRef, where('category', '==', activeCategory), orderBy('createdAt', 'desc'), limit(limitCount))
        : query(articlesRef, orderBy('createdAt', 'desc'), limit(limitCount));
    
    const unsub = onSnapshot(q, (snap) => {
        setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setIsLoading(false);
    }, (e) => { console.warn("Access denied (check rules):", e.code); setIsLoading(false); });

    const unsubSections = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'sections'), 
        (s) => setCustomSections(s.docs.map(d => ({ id: d.id, ...d.data() }))), 
        (e) => console.warn("Sections error:", e.code));

    const unsubStats = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories'), 
        (s) => { if(s.exists()) setDbCategoryCounts(s.data()); }, 
        (e) => console.warn("Stats error:", e.code));

    return () => { unsub(); unsubSections(); unsubStats(); };
  }, [user, limitCount, activeCategory]);

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('theologue_notes', JSON.stringify(notes)); }, [notes]);

  // --- Memos ---
  const activeSections = useMemo(() => {
      const now = new Date();
      return customSections.filter(s => s.isPersistent || (s.expirationDate && new Date(s.expirationDate) > now));
  }, [customSections]);

  const categoryStats = useMemo(() => {
      if (Object.keys(dbCategoryCounts).length > 0) return Object.entries(dbCategoryCounts).sort((a,b) => b[1]-a[1]).slice(0,12);
      const c = {}; articles.forEach(a => c[a.category || "Uncategorized"] = (c[a.category || "Uncategorized"] || 0) + 1);
      return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,12);
  }, [articles, dbCategoryCounts]);

  // Updated categories definition
  const categories = useMemo(() => {
     if (Object.keys(dbCategoryCounts).length > 0) return Object.keys(dbCategoryCounts).sort();
     return Array.from(new Set(articles.map(a => a.category))).sort();
  }, [articles, dbCategoryCounts]);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(a => a.title.toLowerCase().includes(lower) || a.content.toLowerCase().includes(lower));
    }
    return result;
  }, [articles, searchQuery]);

  const getCategoryImage = () => `https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80`;

  // --- Helpers ---
  const handleArticleClick = (a) => { setPreviousView(view); setSelectedArticle(a); setView('article'); };
  const handleBack = () => setView(previousView);
  const handleLogout = () => { setIsAuthenticated(false); setView('home'); };
  const showNotification = (msg) => { setNotification({message: msg}); setTimeout(()=>setNotification(null), 3000); };
  
  const handleNavigateByTitle = async (target) => {
      const title = target.split('#')[0];
      const local = articles.find(a => a.title.toLowerCase() === title.toLowerCase());
      if (local) { handleArticleClick(local); return; }
      if (!db) return;
      try {
          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), where('title', '==', title), limit(1));
          const snap = await getDocs(q);
          if(!snap.empty) handleArticleClick({ id: snap.docs[0].id, ...snap.docs[0].data() });
          else showNotification("Article not found: " + title);
      } catch(e) { console.error(e); }
  };

  const handleLogin = (e) => {
      e.preventDefault();
      if(passwordInput === "admin123") { setLoginStep('mfa'); showNotification("Code: 123456"); }
      else if(mfaInput === "123456") { setIsAuthenticated(true); setPasswordInput(""); setMfaInput(""); setLoginStep('password'); }
      else setLoginError("Incorrect password or code");
  };

  const handleSaveArticle = async () => {
    const articleData = { title: editorTitle, category: editorCategory || "Uncategorized", content: editorContent, lastUpdated: new Date().toISOString().split('T')[0] };
    try {
      if (editingId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', editingId), articleData); showNotification("Updated!"); } 
      else { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), { ...articleData, createdAt: serverTimestamp() }); showNotification("Published!"); }
      setEditingId(null); setEditorTitle(""); setEditorContent(""); setAdminTab('manage');
    } catch (e) { showNotification("Save failed"); }
  };

  const handleDelete = async (id) => {
    if(confirm("Delete this article?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', id));
        showNotification("Deleted");
    }
  };

  // --- Import Logic ---
  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const r = new FileReader();
      r.onload = (ev) => {
          try {
              const xml = new DOMParser().parseFromString(ev.target.result, "text/xml");
              const pages = xml.getElementsByTagName("page");
              pagesRef.current = pages;
              importCursorRef.current = 0;
              abortImportRef.current = false;
              setImportState('active');
              runImport(pages);
          } catch(err) { setImportStatus("Invalid XML"); }
      };
      r.readAsText(file);
  };

  const runImport = async (pages) => {
      if(!db) return;
      let i = importCursorRef.current;
      const total = pages.length;
      const limit = 100000;
      let batchCounts = {};
      
      setImportStatus(`Importing ${i}/${total}...`);
      
      while(i < Math.min(total, limit)) {
          if(abortImportRef.current) { setImportState('paused'); importCursorRef.current = i; return; }
          const batch = writeBatch(db);
          let ops = 0;
          const chunk = Array.from(pages).slice(i, i+10); 
          chunk.forEach(p => {
              const title = p.getElementsByTagName("title")[0]?.textContent;
              const rev = p.getElementsByTagName("revision")[0];
              const text = rev ? rev.getElementsByTagName("text")[0]?.textContent : "";
              if(title && text) {
                  let clean = text.replace(/<!--[\s\S]*?-->/g, "").replace(/\{\|[\s\S]*?\|\}/g, "").replace(/\[\[(File|Image):[^\]]*\]\]/gi, "");
                  clean = clean.replace(/={2,}\s*(.*?)\s*={2,}/g, (m,t) => `<h2 class="text-xl font-bold mt-4">${t}</h2>`);
                  clean = clean.replace(/\[\[#([^|\]]+)(?:\|([^\]]+))?\]\]/g, (m,a,l) => `<span data-wiki-anchor="${a.trim()}" class="text-indigo-600 font-medium hover:underline cursor-pointer">${l||a}</span>`);
                  clean = clean.replace(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g, (m,t,l) => `<span data-wiki-link="${t.trim()}" class="text-indigo-600 font-medium hover:underline cursor-pointer">${l||t}</span>`);
                  
                  const catMatch = text.match(/\[\[Category:([^\]|]+)/i);
                  const cat = catMatch ? catMatch[1].trim() : "Imported";
                  batchCounts[cat] = (batchCounts[cat] || 0) + 1;
                  const ref = doc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'));
                  batch.set(ref, { title, category: cat, content: clean, lastUpdated: new Date().toISOString().split('T')[0], createdAt: serverTimestamp() });
                  ops++;
              }
          });
          if(ops > 0) {
              try { await batch.commit(); i += 10; importCursorRef.current = i; setImportStatus(`Importing... ${i} / ${total}`); await new Promise(r => setTimeout(r, 1000)); } catch(e) { if(e.code === 'resource-exhausted') await new Promise(r => setTimeout(r, 10000)); else i += 10; }
          } else { i += 10; }
      }
      try {
          const sRef = doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories');
          const snap = await getDoc(sRef);
          let final = snap.exists() ? snap.data() : {};
          Object.entries(batchCounts).forEach(([k,v]) => final[k] = (final[k]||0)+v);
          await setDoc(sRef, final);
      } catch(e) { console.error("Stats error", e); }
      setImportState('completed');
      setImportStatus("Import Complete!");
  };
  
  const rebuildStats = async () => {
     if(!db) return;
     setImportStatus("Rebuilding stats...");
     try {
         const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'));
         const snap = await getDocs(q);
         const counts = {};
         snap.forEach(d => { const c = d.data().category || "Uncategorized"; counts[c] = (counts[c]||0)+1; });
         await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories'), counts);
         setImportStatus("Stats Rebuilt");
     } catch(e) { setImportStatus("Rebuild failed"); }
  };

  // --- Render Sections ---
  const renderHome = () => (
      <div className={`max-w-4xl mx-auto space-y-12 animate-fadeIn ${currentTheme.font} ${currentTheme.textSize}`}>
        <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{siteTitle}</h1>
            <div className="max-w-xl mx-auto mb-8 p-6 bg-indigo-50 rounded-2xl text-gray-700">{siteDescription}</div>
            <form onSubmit={e => {e.preventDefault(); setView('search');}} className="relative max-w-lg mx-auto">
                <input className="w-full pl-12 pr-4 py-4 rounded-xl border shadow-sm" placeholder="Search library..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            </form>
        </div>
        <VerseOfTheDayWidget />
        {activeSections.length > 0 && <div className="space-y-8">{activeSections.map(s => <div key={s.id} className="bg-white p-8 rounded-xl shadow-sm border"><HtmlContentRenderer html={s.content} theme={currentTheme} onNavigate={()=>{}}/></div>)}</div>}
        <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart size={18}/> Popular Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(categoryStats).map(([cat, n]) => (
                    <div key={cat} onClick={()=>{setActiveCategory(cat); setView('search'); setLimitCount(50);}} className="relative p-4 bg-white rounded-xl border cursor-pointer hover:shadow-md overflow-hidden group h-32 flex flex-col justify-end" style={{ backgroundImage: `url(${getCategoryImage(cat)})`, backgroundSize: 'cover' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="relative z-10 text-white">
                            <div className="font-bold">{cat}</div>
                            <div className="text-xs opacity-80">{n} articles</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Tag size={18}/> Recent Articles</h2>
            <div className="space-y-4">
                {articles.slice(0,5).map(a => (
                    <div key={a.id} onClick={()=>handleArticleClick(a)} className="p-4 bg-white rounded-xl border hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                        <div><h4 className="font-medium text-gray-900">{a.title}</h4><p className="text-xs text-gray-500">{a.category}</p></div>
                        <ChevronRight size={16} className="text-gray-400"/>
                    </div>
                ))}
            </div>
        </div>
      </div>
  );

  const renderSearch = () => (
    <div className={`max-w-5xl mx-auto ${currentTheme.font}`}>
        <div className="mb-6 flex items-center gap-4">
            <input className="flex-1 p-3 border rounded-lg" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Filter results..." />
            {activeCategory && <button onClick={() => {setActiveCategory(null); setLimitCount(50);}} className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-1">Category: {activeCategory} <X size={14}/></button>}
        </div>
        <div className="grid gap-4">
            {filteredArticles.map(a => (
                <div key={a.id} onClick={() => handleArticleClick(a)} className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md cursor-pointer">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{a.title}</h3>
                    <Badge theme={currentTheme}>{a.category}</Badge>
                </div>
            ))}
        </div>
        {articles.length >= limitCount && <button onClick={() => setLimitCount(l => l + 50)} className="w-full mt-8 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">Load More</button>}
    </div>
  );

  const renderArticle = () => {
      if(!selectedArticle) return null;
      return (
          <div className={`max-w-5xl mx-auto ${currentTheme.font}`}>
              <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium bg-gray-100 px-4 py-2 rounded-lg transition-colors hover:bg-gray-200 w-fit"><ArrowLeft size={16}/> Back</button>
              <div className="bg-white p-8 md:p-12 rounded-2xl border shadow-sm">
                  <div className="mb-6 border-b pb-6">
                      <div className="flex justify-between items-start">
                         <h1 className="text-4xl font-bold mt-4 mb-2 text-gray-900">{selectedArticle.title}</h1>
                         <Badge theme={currentTheme} onClick={() => { setActiveCategory(selectedArticle.category); setView('search'); }}>{selectedArticle.category}</Badge>
                      </div>
                  </div>
                  <div className="prose max-w-none">
                      <HtmlContentRenderer html={selectedArticle.content} theme={currentTheme} onNavigate={handleNavigateByTitle} />
                  </div>
              </div>
              <FloatingNotesWidget article={selectedArticle} noteContent={notes[selectedArticle.id] || ''} onChange={(id, txt) => setNotes({...notes, [id]: txt})} onExport={() => {}} onShare={() => {}} visible={showNoteWidget} setVisible={setShowNoteWidget} theme={currentTheme} />
          </div>
      );
  };

  const renderNotesDashboard = () => (
      <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">My Notes</h2>
          <div className="grid gap-4">
              {Object.entries(notes).map(([id, text]) => (
                  <div key={id} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="font-bold text-yellow-900 mb-2">Article ID: {id}</div>
                      <div className="whitespace-pre-wrap text-sm text-gray-700">{text}</div>
                  </div>
              ))}
              {Object.keys(notes).length === 0 && <div className="text-center py-20 text-gray-400">No notes yet.</div>}
          </div>
      </div>
  );

  const renderAdmin = () => {
    if(!isAuthenticated) return (
        <div className="max-w-sm mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                {loginStep === 'password' ? <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="w-full p-2 border rounded" placeholder="Password (admin123)" /> : <input value={mfaInput} onChange={e=>setMfaInput(e.target.value)} className="w-full p-2 border rounded" placeholder="Code (123456)" />}
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button className="w-full py-2 bg-indigo-600 text-white rounded font-bold">Next</button>
            </form>
        </div>
    );
    return (
        <div className="max-w-6xl mx-auto flex gap-8">
            <div className="w-64 space-y-2">
                <NavItem icon={PenTool} label="Manage" active={adminTab==='manage'} onClick={()=>setAdminTab('manage')} theme={currentTheme} />
                <NavItem icon={Plus} label="New Article" active={adminTab==='create'} onClick={()=>setAdminTab('create')} theme={currentTheme} />
                <NavItem icon={Upload} label="Import XML" active={adminTab==='import'} onClick={()=>setAdminTab('import')} theme={currentTheme} />
                <NavItem icon={Settings} label="Settings" active={adminTab==='settings'} onClick={()=>setAdminTab('settings')} theme={currentTheme} />
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 w-full"><LogOut size={18}/> Logout</button>
            </div>
            <div className="flex-1 bg-white p-8 rounded-xl border">
                {adminTab === 'create' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Create New Article</h2>
                        <input className="w-full mb-4 p-2 border rounded" placeholder="Title" value={editorTitle} onChange={e=>setEditorTitle(e.target.value)} />
                        <div className="relative mb-4">
                          <input className="w-full p-2 border rounded" placeholder="Category" value={editorCategory} onChange={e=>setEditorCategory(e.target.value)} onFocus={() => setShowCategorySuggestions(true)} onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)} />
                          {showCategorySuggestions && (
                            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                              {categories.filter(c => c.toLowerCase().includes(editorCategory.toLowerCase())).map(c => (
                                <div key={c} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => setEditorCategory(c)}>{c}</div>
                              ))}
                            </div>
                          )}
                        </div>
                        <RichTextEditor content={editorContent} onChange={setEditorContent} theme={currentTheme} />
                        <button onClick={handleSaveArticle} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">Save</button>
                    </div>
                )}
                {adminTab === 'import' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Import XML</h2>
                        {importState === 'idle' ? <input type="file" onChange={handleFileUpload} /> : 
                        <div>
                            <div className="font-bold">{importState}</div>
                            <div className="text-sm text-gray-500 mb-4">{importStatus}</div>
                            <div className="flex gap-2">
                                <button onClick={()=>{abortImportRef.current=true}} className="px-4 py-2 bg-yellow-100 rounded">Pause</button>
                                <button onClick={()=>{if(pagesRef.current){abortImportRef.current=false; setImportState('active'); executeImportLoop(pagesRef.current);}}} className="px-4 py-2 bg-green-100 rounded">Resume</button>
                            </div>
                        </div>}
                    </div>
                )}
                {adminTab === 'settings' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Settings</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-bold">Site Title</label><input className="w-full p-2 border rounded" value={siteTitle} onChange={e=>setSiteTitle(e.target.value)} /></div>
                            <div><label className="block text-sm font-bold">Description</label><textarea className="w-full p-2 border rounded" value={siteDescription} onChange={e=>setSiteDescription(e.target.value)} /></div>
                            <button onClick={rebuildStats} className="px-4 py-2 bg-amber-600 text-white rounded">Rebuild Stats</button>
                        </div>
                    </div>
                )}
                {adminTab === 'manage' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Manage Articles</h2>
                        <input className="w-full p-2 border rounded mb-4" placeholder="Filter articles..." value={adminSearchQuery} onChange={e=>setAdminSearchQuery(e.target.value)} />
                        <div className="space-y-2">
                            {articles.filter(a=>a.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).map(a=>(
                                <div key={a.id} className="flex justify-between p-2 border rounded">
                                    <span>{a.title}</span>
                                    <div className="flex gap-2">
                                        <button onClick={()=>{setEditingId(a.id); setEditorTitle(a.title); setEditorCategory(a.category); setEditorContent(a.content); setAdminTab('create');}} className="text-blue-600"><Edit size={16}/></button>
                                        <button onClick={()=>handleDelete(a.id)} className="text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${currentTheme.font}`}>
      {notification && <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50">{notification.message}</div>}
      <header className="sticky top-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={()=>setView('home')}><Book/> {siteTitle}</div>
           <nav className="flex gap-4">
               <NavItem icon={Layout} label="Home" active={view==='home'} onClick={()=>setView('home')} theme={currentTheme} />
               <NavItem icon={Search} label="Search" active={view==='search'} onClick={()=>setView('search')} theme={currentTheme} />
               <NavItem icon={StickyNote} label="Notes" active={view==='notes'} onClick={()=>setView('notes')} theme={currentTheme} />
               <NavItem icon={Settings} label="Admin" active={view==='admin'} onClick={()=>setView('admin')} theme={currentTheme} />
           </nav>
        </div>
      </header>
      <main className="p-6">
         {view === 'home' && renderHome()}
         {view === 'search' && renderSearch()}
         {view === 'article' && renderArticle()}
         {view === 'notes' && renderNotesDashboard()}
         {view === 'admin' && renderAdmin()}
      </main>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}

// --- APP WRAPPER ---
function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWrapper;