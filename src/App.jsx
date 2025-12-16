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
// If you haven't done this yet, the app will show a setup screen.
const liveFirebaseConfig = {
  apiKey: "AIzaSyC45o7fJuF_akzIZ0eBo1UGGx78ZCnCEk4",
  authDomain: "wicwiki-24d11.firebaseapp.com",
  projectId: "wicwiki-24d11",
  storageBucket: "wicwiki-24d11.firebasestorage.app",
  messagingSenderId: "817508613146",
  appId: "1:817508613146:web:b3e2afa79e539ac75265a3"
};

// --- ERROR BOUNDARY (The Life Raft) ---
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
          <p className="mb-4">Please verify your Firebase Config keys in <code>src/App.jsx</code></p>
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
  // Determine config source safely using window check to avoid ReferenceErrors
  const envConfig = (typeof window !== 'undefined' && window.__firebase_config) 
    ? JSON.parse(window.__firebase_config) 
    : null;
    
  const configToUse = envConfig || liveFirebaseConfig;

  // Check if keys are placeholder values
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

// App ID Management
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

// --- Components ---
const NavItem = ({ icon: Icon, label, active, onClick, theme, title, colorClass, bgClass }) => {
  const textCol = colorClass || theme.colors.text;
  const bgCol = bgClass || theme.colors.bgSoft;
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? `${bgCol} ${textCol}` : `text-gray-500 hover:bg-gray-50 hover:text-gray-900`}`} title={title || label}>
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

// --- HTML Renderer ---
const HtmlContentRenderer = ({ html, theme, onNavigate }) => {
  const renderNodes = (nodes) => Array.from(nodes).map((node, i) => {
      if (node.nodeType === 3) return <span key={i}>{node.textContent}</span>;
      if (node.nodeType === 1) {
        const tagName = node.tagName.toLowerCase();
        if (['script','style'].includes(tagName)) return null;
        const props = { key: i };
        if (node.attributes) Array.from(node.attributes).forEach(attr => { if(/^[a-z0-9-]+$/.test(attr.name)) props[attr.name] = attr.value; });
        
        if (props['data-wiki-link'] && onNavigate) {
          props.onClick = (e) => { e.preventDefault(); e.stopPropagation(); onNavigate(props['data-wiki-link']); };
          props.className = (props.className || '') + ` cursor-pointer ${theme.colors.text} hover:underline font-bold`;
        }
        if (props['data-wiki-anchor']) {
          props.onClick = (e) => { e.preventDefault(); e.stopPropagation(); const el = document.getElementById(props['data-wiki-anchor']); if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
          props.className = (props.className || '') + ` cursor-pointer ${theme.colors.text} hover:underline font-medium`;
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
  if (initError) {
      throw new Error("Firebase Failed: " + initError);
  }

  // --- State ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
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
  
  // Admin & Data
  const [adminTab, setAdminTab] = useState('manage');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [customSections, setCustomSections] = useState([]);
  const [dbCategoryCounts, setDbCategoryCounts] = useState({});
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem('theologue_notes')) || {}; } catch { return {}; } });

  // Import Refs
  const pagesRef = useRef(null);
  const importCursorRef = useRef(0);
  const abortImportRef = useRef(false);
  const [importState, setImportState] = useState('idle');

  // Computed
  const currentTheme = useMemo(() => ({
    font: FONTS.sans,
    textSize: TEXT_SIZES.base,
    colors: COLORS[siteColor],
    textColor: TEXT_COLORS.gray
  }), [siteColor]);

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

  useEffect(() => { localStorage.setItem('theologue_notes', JSON.stringify(notes)); }, [notes]);

  // --- Helpers ---
  const handleArticleClick = (a) => { setSelectedArticle(a); setView('article'); };
  const handleLogout = () => { setIsAuthenticated(false); setView('home'); };
  
  const handleNavigateByTitle = async (target) => {
      const title = target.split('#')[0];
      const local = articles.find(a => a.title.toLowerCase() === title.toLowerCase());
      if (local) { handleArticleClick(local); return; }
      if (!db) return;
      try {
          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), where('title', '==', title), limit(1));
          const snap = await getDocs(q);
          if(!snap.empty) handleArticleClick({ id: snap.docs[0].id, ...snap.docs[0].data() });
          else alert("Article not found: " + title);
      } catch(e) { console.error(e); }
  };

  const handleLogin = (e) => {
      e.preventDefault();
      if(passwordInput === "admin123") { setIsAuthenticated(true); setPasswordInput(""); setLoginError(""); }
      else setLoginError("Incorrect password");
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
          const chunk = Array.from(pages).slice(i, i+10); // Batch size 10

          chunk.forEach(p => {
              const title = p.getElementsByTagName("title")[0]?.textContent;
              const rev = p.getElementsByTagName("revision")[0];
              const text = rev ? rev.getElementsByTagName("text")[0]?.textContent : "";
              if(title && text) {
                  // Clean MediaWiki
                  let clean = text.replace(/<!--[\s\S]*?-->/g, "").replace(/\{\|[\s\S]*?\|\}/g, "").replace(/\[\[(File|Image):[^\]]*\]\]/gi, "");
                  clean = clean.replace(/={2,}\s*(.*?)\s*={2,}/g, (m,t) => `<h2 class="text-xl font-bold mt-4">${t}</h2>`);
                  // Internal Links: [[Target|Label]] -> data-wiki-link="Target"
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
              try {
                  await batch.commit();
                  i += 10;
                  importCursorRef.current = i;
                  setImportStatus(`Importing... ${i} / ${total}`);
                  await new Promise(r => setTimeout(r, 1000)); // Rate limit protection
              } catch(e) {
                  console.error("Batch error", e);
                  if(e.code === 'resource-exhausted') await new Promise(r => setTimeout(r, 10000)); // Backoff
                  else i += 10; // Skip bad batch
              }
          } else {
              i += 10;
          }
      }

      // Update stats
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
     } catch(e) { console.error(e); setImportStatus("Rebuild failed"); }
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
        {customSections.length > 0 && <div className="space-y-8">{customSections.map(s => <div key={s.id} className="bg-white p-8 rounded-xl shadow-sm border"><HtmlContentRenderer html={s.content} theme={currentTheme} onNavigate={()=>{}}/></div>)}</div>}
        <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart size={18}/> Popular Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(dbCategoryCounts).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([cat, n]) => (
                    <div key={cat} onClick={()=>{setActiveCategory(cat); setView('search');}} className="p-4 bg-white rounded-xl border cursor-pointer hover:shadow-md">
                        <div className="font-bold text-gray-800">{cat}</div>
                        <div className="text-xs text-gray-500">{n} articles</div>
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
            {activeCategory && <button onClick={() => setActiveCategory(null)} className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-1">Category: {activeCategory} <X size={14}/></button>}
        </div>
        <div className="grid gap-4">
            {articles.map(a => (
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
              <button onClick={()=>setView('search')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"><ArrowLeft size={16}/> Back</button>
              <div className="bg-white p-8 md:p-12 rounded-2xl border shadow-sm">
                  <div className="mb-6 border-b pb-6">
                      <Badge theme={currentTheme} onClick={() => { setActiveCategory(selectedArticle.category); setView('search'); }}>{selectedArticle.category}</Badge>
                      <h1 className="text-4xl font-bold mt-4 mb-2">{selectedArticle.title}</h1>
                  </div>
                  <div className="prose max-w-none">
                      <HtmlContentRenderer html={selectedArticle.content} theme={currentTheme} onNavigate={handleNavigateByTitle} />
                  </div>
              </div>
          </div>
      );
  };

  const renderAdmin = () => {
    if(!isAuthenticated) return (
        <div className="max-w-sm mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="w-full p-2 border rounded" placeholder="Password (admin123)" />
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button className="w-full py-2 bg-indigo-600 text-white rounded font-bold">Login</button>
            </form>
        </div>
    );
    return (
        <div className="max-w-6xl mx-auto flex gap-8">
            <div className="w-64 space-y-2">
                <NavItem icon={PenTool} label="Manage" active={adminTab==='manage'} onClick={()=>setAdminTab('manage')} theme={currentTheme} />
                <NavItem icon={Upload} label="Import XML" active={adminTab==='import'} onClick={()=>setAdminTab('import')} theme={currentTheme} />
                <NavItem icon={Settings} label="Settings" active={adminTab==='settings'} onClick={()=>setAdminTab('settings')} theme={currentTheme} />
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 w-full"><LogOut size={18}/> Logout</button>
            </div>
            <div className="flex-1 bg-white p-8 rounded-xl border">
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
                {adminTab === 'settings' && <button onClick={rebuildStats} className="px-4 py-2 bg-amber-600 text-white rounded">Rebuild Stats</button>}
                {adminTab === 'manage' && <div>Manage Content...</div>}
            </div>
        </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${currentTheme.font}`}>
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