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
  writeBatch
} from 'firebase/firestore';

// --- CONFIGURATION SECTION ---
// 1. FIREBASE CONFIG
const liveFirebaseConfig = {
  apiKey: "AIzaSyC45o7fJuF_akzIZ0eBo1UGGx78ZCnCEk4",
  authDomain: "wicwiki-24d11.firebaseapp.com",
  projectId: "wicwiki-24d11",
  storageBucket: "wicwiki-24d11.firebasestorage.app",
  messagingSenderId: "817508613146",
  appId: "1:817508613146:web:b3e2afa79e539ac75265a3"
};

// 2. GEMINI AI CONFIG
const GEMINI_API_KEY = "AIzaSyBkDJkm618_QadoblgpgLFtWxAApNjVywg"; 

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
          <p className="mb-4">Please verify your Config keys in <code>src/App.jsx</code></p>
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

const POPULAR_VERSE_REFS = [
  "John 3:16", "Philippians 4:13", "Psalm 23:1", "Romans 8:28", "Jeremiah 29:11",
  "Proverbs 3:5-6", "Isaiah 40:31", "Joshua 1:9", "Romans 12:2", "Galatians 5:22-23",
  "Hebrews 11:1", "2 Timothy 1:7", "1 Corinthians 13:4-7", "Matthew 28:19-20", "Psalm 46:10",
  "John 14:6", "Matthew 11:28", "Psalm 119:105", "Ephesians 2:8-9", "Romans 3:23"
];

// --- Components ---
const NavItem = ({ icon: Icon, label, active, onClick, theme, title, colorClass, bgClass }) => {
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
    if (editorRef.current && (content || "") !== editorRef.current.innerHTML && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = content || "";
    }
  }, [content]);

  const exec = (cmd, val=null) => { 
    document.execCommand(cmd, false, val); 
    if (editorRef.current) onChange(editorRef.current.innerHTML); 
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 ${theme.colors.ring} focus-within:border-transparent`}>
      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <button type="button" onClick={(e)=>{e.preventDefault(); exec('bold');}} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Bold"><Bold size={18}/></button>
        <button type="button" onClick={(e)=>{e.preventDefault(); exec('italic');}} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Italic"><Italic size={18}/></button>
        <button type="button" onClick={(e)=>{e.preventDefault(); exec('formatBlock','H3');}} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Heading"><Type size={18}/></button>
        <button type="button" onClick={(e)=>{e.preventDefault(); exec('insertUnorderedList');}} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Bullet List"><List size={18}/></button>
      </div>
      <div 
        ref={editorRef} 
        contentEditable 
        className={`p-4 outline-none max-w-none text-gray-800 ${theme.font} text-base leading-relaxed`}
        style={{ minHeight: '300px' }}
        onInput={e => onChange(e.currentTarget.innerHTML)} 
      />
    </div>
  );
};

// --- YouTube Embed Component ---
const YouTubeEmbed = ({ videoId }) => (
  <div className="my-8 w-full max-w-3xl mx-auto overflow-hidden rounded-xl shadow-lg border border-gray-200 bg-black relative" style={{ paddingBottom: '56.25%', height: 0 }}>
    <iframe 
      src={`https://www.youtube.com/embed/${videoId}`} 
      title="YouTube video player"
      className="absolute top-0 left-0 w-full h-full"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowFullScreen 
    />
  </div>
);

// --- Verse Tooltip Component ---
const VerseTooltip = ({ reference, theme }) => {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleMouseEnter = async () => {
    if (text || loading || error) return;
    setLoading(true);
    try {
      const cleanRef = reference.replace(/[.,;:]$/, '').replace(/\s+/g, ' ').trim();
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

// --- HTML Renderer (Verse & YouTube Logic) ---
const HtmlContentRenderer = ({ html, theme, onNavigate }) => {
  // STRICT BIBLE REGEX (Whitelist + Abbreviations)
  const books = [
    "Genesis", "Gen", "Ge", "Gn", "Exodus", "Ex", "Exod", "Leviticus", "Lev", "Le", "Lv",
    "Numbers", "Num", "Nu", "Nm", "Nb", "Deuteronomy", "Deut", "De", "Dt", "Joshua", "Josh", "Jos", "Jsh",
    "Judges", "Judg", "Jdg", "Jg", "Jdgs", "Ruth", "Rth", "Ru",
    "1 Samuel", "1 Sam", "1 Sa", "1Sm", "1S", "I Samuel", "I Sam", "I Sa",
    "2 Samuel", "2 Sam", "2 Sa", "2Sm", "2S", "II Samuel", "II Sam", "II Sa",
    "1 Kings", "1 Kgs", "1 Ki", "1K", "I Kings", "I Kgs", "I Ki",
    "2 Kings", "2 Kgs", "2 Ki", "2K", "II Kings", "II Kgs", "II Ki",
    "1 Chronicles", "1 Chron", "1 Chr", "1 Ch", "I Chronicles", "I Chron", "I Chr",
    "2 Chronicles", "2 Chron", "2 Chr", "2 Ch", "II Chronicles", "II Chron", "II Chr",
    "Ezra", "Ezr", "Nehemiah", "Neh", "Ne", "Esther", "Esth", "Est", "Es",
    "Job", "Jb", "Psalms?", "Ps", "Psa", "Psm", "Pss", "Proverbs", "Prov", "Pro", "Prv", "Pr",
    "Ecclesiastes", "Eccl", "Eccles", "Ecc", "Ec", "Qoh", "Song of Solomon", "Song of Songs", "Song", "So", "Canticles", "Cant",
    "Isaiah", "Isa", "Is", "Jeremiah", "Jer", "Je", "Jr", "Lamentations", "Lam", "La",
    "Ezekiel", "Ezek", "Eze", "Ezk", "Daniel", "Dan", "Da", "Dn", "Hosea", "Hos", "Ho",
    "Joel", "Jl", "Amos", "Am", "Obadiah", "Obad", "Ob", "Jonah", "Jon", "Jnh",
    "Micah", "Mic", "Mc", "Nahum", "Nah", "Na", "Habakkuk", "Hab", "Hb",
    "Zephaniah", "Zeph", "Zep", "Zp", "Haggai", "Hag", "Hg", "Zechariah", "Zech", "Zec", "Zc",
    "Malachi", "Mal", "Ml", "Matthew", "Matt", "Mt", "Mtt", "Mark", "Mrk", "Mk", "Mr",
    "Luke", "Luk", "Lk", "John", "Jhn", "Jn", "Acts", "Ac", "Romans", "Rom", "Ro", "Rm",
    "1 Corinthians", "1 Cor", "1 Co", "I Corinthians", "I Cor", "I Co",
    "2 Corinthians", "2 Cor", "2 Co", "II Corinthians", "II Cor", "II Co",
    "Galatians", "Gal", "Ga", "Ephesians", "Eph", "Ep", "Philippians", "Phil", "Php", "Pp",
    "Colossians", "Col", "Co", "1 Thessalonians", "1 Thess", "1 Th", "I Thessalonians", "I Thess", "I Th",
    "2 Thessalonians", "2 Thess", "2 Th", "II Thessalonians", "II Thess", "II Th",
    "1 Timothy", "1 Tim", "1 Ti", "I Timothy", "I Tim", "I Ti",
    "2 Timothy", "2 Tim", "2 Ti", "II Timothy", "II Tim", "II Ti",
    "Titus", "Tit", "Ti", "Philemon", "Philem", "Phm", "Pm", "Hebrews", "Heb",
    "James", "Jas", "Jm", "1 Peter", "1 Pet", "1 Pe", "1 Pt", "I Peter", "I Pet", "I Pe",
    "2 Peter", "2 Pet", "2 Pe", "2 Pt", "II Peter", "II Pet", "II Pe",
    "1 John", "1 Jn", "1 J", "I John", "I Jn", "2 John", "2 Jn", "2 J", "II John", "II Jn",
    "3 John", "3 Jn", "3 J", "III John", "III Jn", "Jude", "Jd", "Revelation", "Rev", "Rv"
  ];
  
  const sortedBooks = books.sort((a,b) => b.length - a.length).join("|");
  const verseRegex = new RegExp(`(\\b(?:${sortedBooks})\\s+\\d+:\\d+(?:[-–,]\\d+)*\\b)`, 'gi');
  
  // YOUTUBE REGEX: Matches standard URL formats
  const youtubeRegex = /\b(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:\S+)?/g;
  
  const renderNodes = (nodes) => Array.from(nodes).map((node, i) => {
      // --- TEXT NODE PROCESSING ---
      if (node.nodeType === 3) {
        const text = node.textContent;
        if(!text.trim()) return null;
        
        // 1. Split by YouTube URL to find embeds
        const parts = text.split(youtubeRegex);
        
        return (
          <React.Fragment key={i}>
            {parts.map((part, index) => {
               // Odd index = Captured YouTube ID
               if (index % 2 === 1 && part.length === 11) {
                   return <YouTubeEmbed key={index} videoId={part} />;
               }
               
               // Even index = Normal Text -> Process for Verses
               const verseParts = part.split(verseRegex);
               return verseParts.map((vPart, vIndex) => {
                   if (verseRegex.test(vPart)) {
                       return <VerseTooltip key={`${index}-${vIndex}`} reference={vPart} theme={theme} />;
                   }
                   return <span key={`${index}-${vIndex}`}>{vPart}</span>;
               });
            })}
          </React.Fragment>
        );
      }
      
      // --- ELEMENT NODE PROCESSING ---
      if (node.nodeType === 1) {
        const tagName = node.tagName.toLowerCase();
        if (['script','style'].includes(tagName)) return null;
        
        // AUTO-CONVERT LINKS: Check if <a> tag is a YouTube Link
        if (tagName === 'a') {
            const href = node.getAttribute('href');
            const ytMatch = href && href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
            if (ytMatch) {
                return <YouTubeEmbed key={i} videoId={ytMatch[1]} />;
            }
        }

        const props = { key: i };
        
        if (node.attributes) Array.from(node.attributes).forEach(attr => { 
            if (attr.name === 'style') return; // Prevent React Error #62
            if (attr.name === 'class') { props.className = attr.value; return; }
            if(/^[a-z0-9-]+$/.test(attr.name)) props[attr.name] = attr.value; 
        });

        let baseClass = props.className || '';
        // Typography styles
        if (tagName === 'p') baseClass += ' mb-6 leading-relaxed text-gray-800 text-base md:text-lg';
        if (tagName === 'h1') baseClass += ' text-3xl font-extrabold mt-10 mb-6 text-gray-900 border-b pb-4';
        if (tagName === 'h2') baseClass += ' text-2xl font-bold mt-8 mb-4 text-gray-800 border-b pb-2 border-gray-100';
        if (tagName === 'h3') baseClass += ' text-xl font-bold mt-6 mb-3 text-gray-800';
        if (tagName === 'ul') baseClass += ' list-disc list-outside mb-6 ml-6 text-gray-700 space-y-2';
        if (tagName === 'ol') baseClass += ' list-decimal list-outside mb-6 ml-6 text-gray-700 space-y-2';
        if (tagName === 'li') baseClass += ' pl-1';
        if (tagName === 'blockquote') baseClass += ' border-l-4 border-indigo-300 pl-6 py-3 my-6 italic text-gray-700 bg-gray-50 rounded-r-lg';
        if (tagName === 'b' || tagName === 'strong') baseClass += ' font-bold text-gray-900';
        if (tagName === 'i' || tagName === 'em') baseClass += ' italic';
        
        props.className = baseClass;
        
        // Link handling
        if (props['data-wiki-link'] && onNavigate) {
          props.onClick = (e) => { e.preventDefault(); e.stopPropagation(); onNavigate(props['data-wiki-link']); };
          props.className += ` cursor-pointer ${theme.colors.text} hover:underline font-bold bg-indigo-50 px-1 rounded`;
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

const VerseOfTheDayWidget = () => {
  const [verseData, setVerseData] = useState({ text: "Loading verse...", ref: "" });
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRandomVerse = async () => {
      setLoading(true);
      setAnimate(true);
      try {
          const randomRef = POPULAR_VERSE_REFS[Math.floor(Math.random() * POPULAR_VERSE_REFS.length)];
          const res = await fetch(`https://bible-api.com/${encodeURIComponent(randomRef)}?translation=kjv`);
          const data = await res.json();
          setTimeout(() => {
              setVerseData({ text: data.text.trim(), ref: data.reference });
              setAnimate(false);
              setLoading(false);
          }, 300);
      } catch (e) {
          setVerseData({ text: "The LORD is my shepherd; I shall not want.", ref: "Psalm 23:1" });
          setAnimate(false);
          setLoading(false);
      }
  };

  useEffect(() => {
     fetchRandomVerse();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-8 shadow-lg text-white mb-8">
       <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
         <div className={`flex-1 text-center md:text-left transition-opacity duration-300 ${animate ? 'opacity-0' : 'opacity-100'}`}>
           <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-indigo-200 text-sm font-medium uppercase tracking-widest"><Sparkles size={14} className="text-yellow-400" /> Verse of the Day</div>
           {loading ? <div className="h-6 w-3/4 bg-white/20 animate-pulse rounded mx-auto md:mx-0"></div> : <p className="text-xl font-serif italic mb-2">"{verseData.text}"</p>}
           {!loading && <p className="font-sans font-bold text-yellow-400">{verseData.ref} <span className="text-white/40 font-normal text-xs ml-1">KJV</span></p>}
         </div>
         <button 
             onClick={fetchRandomVerse}
             disabled={loading}
             className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-sm font-medium transition-all group border border-white/10 shrink-0"
         >
             <RefreshCw size={14} className={`transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
             New Verse
         </button>
       </div>
    </div>
  );
};

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
  const [categoryStyle, setCategoryStyle] = useState("gradient"); // 'gradient' or 'image'
  const [imageSeed, setImageSeed] = useState(0);
  const [siteLogo, setSiteLogo] = useState(null);
  
  // Admin & Data
  const [adminTab, setAdminTab] = useState('manage');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [customSections, setCustomSections] = useState([]);
  const [dbCategoryCounts, setDbCategoryCounts] = useState({});
  
  // Updated: Session-based Notes (clears on exit, warns on close)
  const [notes, setNotes] = useState(() => { 
      try { 
        if (typeof window === 'undefined') return {};
        // Migration: If user had old persistent notes, move them to session
        const localNotes = localStorage.getItem('theologue_notes');
        if (localNotes) {
            localStorage.removeItem('theologue_notes');
            sessionStorage.setItem('theologue_notes', localNotes);
            return JSON.parse(localNotes);
        }
        return JSON.parse(sessionStorage.getItem('theologue_notes')) || {}; 
      } 
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
    
    getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global')).then(snap => {
        if(snap.exists()) {
            const d = snap.data();
            if(d.title) setSiteTitle(d.title);
            if(d.description) setSiteDescription(d.description);
            if(d.color) setSiteColor(d.color);
            if(d.font) setSiteFont(d.font);
            if(d.logo) setSiteLogo(d.logo);
            if(d.categoryStyle) setCategoryStyle(d.categoryStyle);
        }
    });

    const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
    
    const unsub = onSnapshot(articlesRef, (snap) => {
        let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        fetched.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
        setArticles(fetched);
        setIsLoading(false);
    }, (e) => { 
        console.warn("Firestore error (handled):", e.code); 
        setIsLoading(false); 
    });

    const unsubSections = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'sections'), 
        (s) => setCustomSections(s.docs.map(d => ({ id: d.id, ...d.data() }))), 
        (e) => console.warn("Sections error:", e.code));

    const unsubStats = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories'), 
        (s) => { if(s.exists()) setDbCategoryCounts(s.data()); }, 
        (e) => console.warn("Stats error:", e.code));

    return () => { unsub(); unsubSections(); unsubStats(); };
  }, [user]);

  // Ref to hold notes for listener
  const notesRef = useRef(notes);
  
  // Update ref and storage when notes change
  useEffect(() => { 
      notesRef.current = notes;
      if (typeof window !== 'undefined') {
          sessionStorage.setItem('theologue_notes', JSON.stringify(notes)); 
      }
  }, [notes]);

  // Warning on Tab Close/Exit
  useEffect(() => {
      const handleBeforeUnload = (e) => {
          if (Object.keys(notesRef.current).length > 0) {
              e.preventDefault();
              e.returnValue = ''; // Trigger browser default warning dialog
          }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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

  const categories = useMemo(() => {
     if (Object.keys(dbCategoryCounts).length > 0) return Object.keys(dbCategoryCounts).sort();
     return Array.from(new Set(articles.map(a => a.category))).sort();
  }, [articles, dbCategoryCounts]);

  // Filter Logic
  const filteredArticles = useMemo(() => {
    let result = articles;
    if (activeCategory) {
        result = result.filter(a => a.category === activeCategory);
    }
    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(a => a.title.toLowerCase().includes(lower) || a.content.toLowerCase().includes(lower));
    }
    return result;
  }, [articles, searchQuery, activeCategory]);

  const getCategoryImage = (cat) => {
      if(!cat) return "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)";
      
      // OPTION 1: Gradient Mode (Default)
      if (categoryStyle === 'gradient') {
          let hash = 0;
          for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
          const styles = [
            "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)", // Blue
            "linear-gradient(135deg, #10b981 0%, #064e3b 100%)", // Emerald
            "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)", // Amber
            "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)", // Violet
            "linear-gradient(135deg, #ec4899 0%, #831843 100%)", // Pink
            "linear-gradient(135deg, #6366f1 0%, #312e81 100%)", // Indigo
            "linear-gradient(to right, #243949 0%, #517fa4 100%)", // Steel
            "linear-gradient(to right, #6a11cb 0%, #2575fc 100%)", // Deep Purple
          ];
          return styles[Math.abs(hash) % styles.length];
      }

      // OPTION 2: Dynamic Image Mode
      // Curated list of theological/library style images
      const images = {
          bible: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=800&q=80", // Open Bible
          church: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=800&q=80", // Church Interior
          cross: "https://images.unsplash.com/photo-1507646870321-df8b26bc43c2?auto=format&fit=crop&w=800&q=80", // Cross
          history: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80", // Old Book/History
          sky: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80", // Sky/Light
          nature: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", // Nature
          library: "https://images.unsplash.com/photo-1507842217121-9e691b2d0941?auto=format&fit=crop&w=800&q=80", // Library
          scroll: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80", // Scroll/Parchment
          candles: "https://images.unsplash.com/photo-1602607303737-b1c1d9a20274?auto=format&fit=crop&w=800&q=80", // Candles
          community: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80", // People
      };

      const catLower = cat.toLowerCase();
      let selectedImage = images.library; // Default

      // Keywords Mapping
      if (catLower.includes('bibl') || catLower.includes('scripture') || catLower.includes('testament')) selectedImage = images.bible;
      else if (catLower.includes('church') || catLower.includes('cathedral') || catLower.includes('chapel')) selectedImage = images.church;
      else if (catLower.includes('jesus') || catLower.includes('christ') || catLower.includes('cross') || catLower.includes('salvation')) selectedImage = images.cross;
      else if (catLower.includes('history') || catLower.includes('ancient') || catLower.includes('old') || catLower.includes('archaeology')) selectedImage = images.history;
      else if (catLower.includes('god') || catLower.includes('spirit') || catLower.includes('heaven') || catLower.includes('creation') || catLower.includes('prayer')) selectedImage = images.sky;
      else if (catLower.includes('nature') || catLower.includes('world') || catLower.includes('earth')) selectedImage = images.nature;
      else if (catLower.includes('scroll') || catLower.includes('manuscript') || catLower.includes('text')) selectedImage = images.scroll;
      else if (catLower.includes('light') || catLower.includes('hope') || catLower.includes('advent')) selectedImage = images.candles;
      else if (catLower.includes('people') || catLower.includes('women') || catLower.includes('men') || catLower.includes('community') || catLower.includes('mission')) selectedImage = images.community;
      else {
          // Dynamic Fallback for unknown categories: consistently map to one of the high-quality images based on name
          const fallbackList = Object.values(images);
          let hash = 0;
          for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
          selectedImage = fallbackList[Math.abs(hash) % fallbackList.length];
      }

      return `url(${selectedImage})`;
  };

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
          const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
          const snap = await getDocs(articlesRef);
          const found = snap.docs.find(d => d.data().title === title);
          if(found) handleArticleClick({ id: found.id, ...found.data() });
          else showNotification("Article not found: " + title);
      } catch(e) { console.error(e); }
  };

  const handleLogin = (e) => {
      e.preventDefault();
      setLoginError("");
      if(loginStep === "password") {
          if(passwordInput === "admin123") { setLoginStep('mfa'); showNotification("Code: Accepted"); }
          else setLoginError("Incorrect password");
      } else {
          if(mfaInput === "123456") { setIsAuthenticated(true); setPasswordInput(""); setMfaInput(""); setLoginStep('password'); }
          else setLoginError("Invalid Verification Code");
      }
  };

  const handleSaveArticle = async () => {
    const articleData = { 
        title: editorTitle, 
        category: (editorCategory || "Uncategorized").trim(), 
        content: editorContent, 
        lastUpdated: new Date().toISOString().split('T')[0] 
    };
    try {
      if (editingId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', editingId), articleData); showNotification("Updated!"); } 
      else { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), { ...articleData, createdAt: serverTimestamp() }); showNotification("Published!"); }
      setEditingId(null); setEditorTitle(""); setEditorContent(""); setAdminTab('manage');
    } catch (e) { showNotification("Save failed"); }
  };

  const handleSaveSettings = async () => {
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), {
              title: siteTitle,
              description: siteDescription,
              color: siteColor,
              font: siteFont,
              logo: siteLogo,
              categoryStyle: categoryStyle // SAVE NEW SETTING
          });
          showNotification("Settings Saved!");
      } catch(e) { console.error(e); showNotification("Failed to save settings"); }
  };
  
  const handleLogoUpload = (event) => { 
    const file = event.target.files[0]; 
    if (file) { 
        const reader = new FileReader(); 
        reader.onload = (e) => setSiteLogo(e.target.result); 
        reader.readAsDataURL(file); 
    } 
  };

  const handleDelete = async (id) => {
    if(confirm("Delete this article?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', id));
        showNotification("Deleted");
    }
  };

  const handleAddSection = async () => {
      if(!sectionContent) return;
      if (!sectionPersistent && !sectionExpiry) {
        showNotification("Please select an expiry date or make it persistent.");
        return;
      }
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'sections'), {
              content: sectionContent,
              isPersistent: sectionPersistent,
              expirationDate: sectionPersistent ? null : sectionExpiry,
              createdAt: serverTimestamp()
          });
          setSectionContent("");
          setSectionPersistent(false);
          setSectionExpiry("");
          showNotification("Section added!");
      } catch(e) {
          console.error(e);
          showNotification("Failed to add section");
      }
  };

  const handleDeleteSection = async (id) => {
      if(!confirm("Delete this section?")) return;
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sections', id));
          showNotification("Section deleted");
      } catch(e) {
          showNotification("Failed to delete");
      }
  };

  const handleNoteChange = (id, text) => {
      setNotes(prev => ({ ...prev, [id]: text }));
  };

  const handleShareNote = (id) => {
      if(notes[id]) {
          navigator.clipboard.writeText(notes[id]);
          showNotification("Note copied to clipboard!");
      } else {
          showNotification("No note to share.");
      }
  };

  const exportNotes = (all = false, id = null) => {
      const content = all 
        ? Object.entries(notes).map(([k,v]) => {
            const article = articles.find(a => a.id === k);
            const title = article ? article.title : `Unknown Article (ID: ${k})`;
            return `Article: ${title}\n${v}\n-------------------`;
        }).join('\n\n')
        : (notes[id] || "");
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = all ? 'all_notes.txt' : `note_${id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleDeleteAll = async () => {
    if(!confirm("DANGER: This will delete ALL articles. This cannot be undone. Are you sure?")) return;
    if(!confirm("Are you REALLY sure?")) return;
    
    setImportStatus("Deleting all articles...");
    try {
        const deleteBatch = async () => {
            const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
            const snapshot = await getDocs(articlesRef); 
            if (snapshot.size === 0) {
                setImportStatus(null);
                showNotification("All articles deleted.");
                return;
            }
            const batch = writeBatch(db);
            let count = 0;
            snapshot.docs.forEach((doc) => {
                if (count < 400) { 
                    batch.delete(doc.ref);
                    count++;
                }
            });
            await batch.commit();
            if (snapshot.size > 400) deleteBatch();
            else {
               setImportStatus(null);
               showNotification("All articles deleted.");
            }
        };
        await deleteBatch();
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories'), {});
        setDbCategoryCounts({});
    } catch(e) {
        console.error(e);
        showNotification("Deletion failed.");
    }
  };

  const callGemini = async (promptType, customPrompt = "") => {
    if (!selectedArticle) return;
    setIsAiLoading(true); setAiResponse(""); setAiPanelOpen(true);
    const apiKey = GEMINI_API_KEY; 
    if (apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE" || !apiKey) {
      setAiResponse("Please set your Gemini API Key in the src/App.jsx configuration section.");
      setIsAiLoading(false);
      return;
    }

    const cleanContent = selectedArticle.content.replace(/<[^>]+>/g, ''); 
    let userQuery = ""; 
    switch (promptType) { 
        case 'summary': userQuery = `Summarize this theological article in 3-5 concise bullet points. The article is titled "${selectedArticle.title}":\n\n${cleanContent}`; break; 
        case 'devotional': userQuery = `Write a short, encouraging daily devotional and prayer based on the themes found in this article titled "${selectedArticle.title}". Content:\n\n${cleanContent}`; break; 
        case 'chat': userQuery = `Context: You are a helpful theological assistant answering questions about the article "${selectedArticle.title}". Article Content: ${cleanContent}\n\nUser Question: ${customPrompt}`; break; 
        default: userQuery = customPrompt; 
    } 
    const payload = { contents: [{ parts: [{ text: userQuery }] }] }; 
    let attempt = 0; 
    const fetchWithRetry = async () => { 
        try { 
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); 
            if (!response.ok) throw new Error(response.statusText); 
            const data = await response.json(); 
            setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text); 
        } catch (error) { 
            if (attempt < 2) { 
                await new Promise(r => setTimeout(r, 1000)); 
                attempt++;
                await fetchWithRetry(); 
            } else { 
                setAiResponse("Sorry, I couldn't reach the AI service at this time."); 
            } 
        } 
    }; 
    await fetchWithRetry(); 
    setIsAiLoading(false); 
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
      
      setImportStatus(`Importing ${i} / ${total}`);
      setImportProgress(0); 
      
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
                  let clean = text.replace(/<!--[\s\S]*?-->/g, ""); // Remove comments
                  clean = clean.replace(/\{\|[\s\S]*?\|\}/g, ""); // Remove tables (often messy)
                  clean = clean.replace(/\[\[(File|Image):[^\]]*\]\]/gi, ""); // Remove images/files
                  
                  // NEW: Remove Categories from text body (they are metadata)
                  clean = clean.replace(/\[\[Category:[^\]]+\]\]/gi, "");

                  // NEW: Handle MediaWiki Bold and Italic
                  clean = clean.replace(/'''(.+?)'''/g, "<b>$1</b>"); // Bold
                  clean = clean.replace(/''(.+?)''/g, "<i>$1</i>"); // Italic
                  
                  // Remove duplicate title heading from content
                  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const titleRegex = new RegExp(`^\\s*={2,}\\s*${escapedTitle}\\s*={2,}\\s*`, 'im');
                  clean = clean.replace(titleRegex, "");

                  // Headings
                  clean = clean.replace(/={2,}\s*(.*?)\s*={2,}/g, (m,t) => `<h2 class="text-xl font-bold mt-4">${t}</h2>`);
                  
                  // Anchors
                  clean = clean.replace(/\[\[#([^|\]]+)(?:\|([^\]]+))?\]\]/g, (m,a,l) => `<span data-wiki-anchor="${a.trim()}" class="text-indigo-600 font-medium hover:underline cursor-pointer">${l||a}</span>`);
                  
                  // NEW: Improved Link Handling
                  // Handles [[Article_Name]] -> converts to space-based title for lookup
                  // Handles [[Article|Label]]
                  clean = clean.replace(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g, (m,t,l) => {
                      const target = t.trim().replace(/_/g, ' '); // Normalize underscores to spaces for navigation
                      const label = l || target; // Use target as label if label is missing
                      return `<span data-wiki-link="${target}" class="text-indigo-600 font-medium hover:underline cursor-pointer">${label}</span>`;
                  });
                  
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
                  setImportProgress(Math.min(100, Math.round((i / total) * 100)));
                  await new Promise(r => setTimeout(r, 200)); 
              } catch(e) { if(e.code === 'resource-exhausted') await new Promise(r => setTimeout(r, 10000)); else i += 10; }
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
      setImportProgress(100);
  };
  
  const rebuildStats = async () => {
     if(!db) return;
     setImportStatus("Rebuilding stats...");
     try {
         const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
         const snap = await getDocs(articlesRef); 
         const counts = {};
         snap.forEach(d => { const c = d.data().category || "Uncategorized"; counts[c] = (counts[c]||0)+1; });
         await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories'), counts);
         setImportStatus("Stats Rebuilt");
     } catch(e) { setImportStatus("Rebuild failed"); }
  };

  // --- Render Sections ---
  const renderHome = () => (
      <div className={`max-w-4xl mx-auto space-y-12 animate-fadeIn ${currentTheme.font} ${currentTheme.textSize}`}>
        {/* IMPROVED NOTIFICATION TICKER */}
        {notification && (
            <div className="fixed top-6 right-6 z-[100] animate-fadeIn">
                <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50 backdrop-blur-sm">
                <CheckCircle className="text-emerald-400" size={20} />
                <span className="font-medium">{notification.message}</span>
                </div>
            </div>
        )}

        <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-4">
               {siteTitle}
            </h1>
            <div className="max-w-2xl mx-auto mb-8 px-4">
              <div className={`relative rounded-2xl ${currentTheme.colors.bgSoft} border ${currentTheme.colors.border} shadow-sm text-center transition-all duration-300 ${isWelcomeMinimized ? 'p-4' : 'p-6'}`}>
                <button 
                  onClick={() => setIsWelcomeMinimized(!isWelcomeMinimized)}
                  className={`absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 ${currentTheme.colors.text} opacity-50 hover:opacity-100 transition-opacity`}
                  title={isWelcomeMinimized ? "Expand" : "Minimize"}
                >
                  {isWelcomeMinimized ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}
                </button>

                <div className={`${currentTheme.textColor} ${isWelcomeMinimized ? 'text-sm' : 'text-lg'} leading-relaxed font-medium`}>
                  {isWelcomeMinimized ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="truncate max-w-md">{siteDescription}</span>
                      <button onClick={() => setIsWelcomeMinimized(false)} className={`text-xs font-bold underline ${currentTheme.colors.text} whitespace-nowrap`}>Read More</button>
                    </div>
                  ) : (
                    siteDescription
                  )}
                </div>
                {!isWelcomeMinimized && (
                  <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 ${currentTheme.colors.bgSoft} border-b border-r ${currentTheme.colors.border} transform rotate-45`}></div>
                )}
              </div>
            </div>
            <form onSubmit={e => {e.preventDefault(); setView('search');}} className="relative max-w-lg mx-auto">
                <input className="w-full pl-12 pr-4 py-4 rounded-xl border shadow-sm" placeholder="Search library..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            </form>
        </div>
        <VerseOfTheDayWidget />
        {activeSections.length > 0 && <div className="space-y-8">{activeSections.map(s => <div key={s.id} className="bg-white p-8 rounded-xl shadow-sm border"><HtmlContentRenderer html={s.content} theme={currentTheme} onNavigate={()=>{}}/></div>)}</div>}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2"><BarChart size={18}/> Popular Categories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* FIX: Map directly over the array, do NOT use Object.entries on an array */}
                {categoryStats.map(([cat, n]) => (
                    <div key={cat} onClick={()=>{setActiveCategory(cat); setSearchQuery(""); setView('search'); setLimitCount(50);}} className="relative p-4 bg-white rounded-xl border cursor-pointer hover:shadow-md overflow-hidden group h-32 flex flex-col justify-between" style={{ background: getCategoryImage(cat), backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div className={`absolute inset-0 transition-colors ${categoryStyle === 'image' ? 'bg-black/40 hover:bg-black/30' : 'bg-black/10 hover:bg-black/0'}`}></div>
                        <div className="relative z-10 text-white font-bold text-lg leading-tight p-2 drop-shadow-md break-words">{cat}</div>
                        <div className="relative z-10 self-end p-2">
                            <span className="text-xs font-medium text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm">{n} Articles</span>
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
            {filteredArticles.slice(0, limitCount).map(a => (
                <div key={a.id} onClick={() => handleArticleClick(a)} className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md cursor-pointer">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{a.title}</h3>
                    <Badge theme={currentTheme}>{a.category}</Badge>
                </div>
            ))}
            {filteredArticles.length === 0 && <div className="text-center py-10 text-gray-400">No articles found matching your criteria.</div>}
        </div>
        {filteredArticles.length >= limitCount && <button onClick={() => setLimitCount(l => l + 50)} className="w-full mt-8 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">Load More</button>}
    </div>
  );

  // --- Article Render (Restored Layout) ---
  const renderArticle = () => {
      if(!selectedArticle) return null;
      return (
          <div className={`max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 animate-fadeIn relative ${currentTheme.font} ${currentTheme.textSize}`}>
              <div className="flex-1 bg-white min-h-[80vh] p-8 md:p-12 shadow-sm rounded-xl border border-gray-100">
                <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium bg-gray-100 px-4 py-2 rounded-lg transition-colors hover:bg-gray-200 w-fit"><ArrowLeft size={16}/> Back</button>
                  <div className="mb-8 border-b border-gray-100 pb-6">
                      <div className="flex justify-between items-start">
                         <h1 className="text-4xl font-bold mt-4 mb-2 text-gray-900">{selectedArticle.title}</h1>
                         <Badge theme={currentTheme} onClick={() => { setActiveCategory(selectedArticle.category); setSearchQuery(""); setView('search'); }}>{selectedArticle.category}</Badge>
                      </div>
                  </div>
                  <div className="prose max-w-none">
                      <HtmlContentRenderer html={selectedArticle.content} theme={currentTheme} onNavigate={handleNavigateByTitle} />
                  </div>
              </div>
              
              {/* Restored Sidebar */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="sticky top-20 flex flex-col gap-4">
                  <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <button onClick={() => setSidebarTab('ai')} className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'ai' ? `${currentTheme.colors.bgSoft} ${currentTheme.colors.text}` : 'text-gray-500 hover:text-gray-900'}`}><Sparkles size={16} /> AI Assistant</button>
                    <button onClick={() => setSidebarTab('notes')} className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'notes' ? `${currentTheme.colors.bgSoft} ${currentTheme.colors.text}` : 'text-gray-500 hover:text-gray-900'}`}><PenLine size={16} /> Notes</button>
                  </div>
                  
                  {sidebarTab === 'ai' && (
                    <div className={`bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm`}>
                      <div className="space-y-3 mb-6">
                        <button onClick={() => callGemini('summary')} className={`w-full text-left px-4 py-3 bg-white hover:${currentTheme.colors.bgSoft} border border-gray-200 rounded-lg text-sm font-medium ${currentTheme.textColor} transition-colors flex items-center gap-2`}><FileText size={16} className="text-blue-500" /> Summarize Article</button>
                        <button onClick={() => callGemini('devotional')} className={`w-full text-left px-4 py-3 bg-white hover:${currentTheme.colors.bgSoft} border border-gray-200 rounded-lg text-sm font-medium ${currentTheme.textColor} transition-colors flex items-center gap-2`}><Book size={16} className="text-emerald-500" /> Generate Devotional</button>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ask a Question</label>
                        <div className="relative"><input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && callGemini('chat', aiPrompt)} placeholder="Ask about this topic..." className={`w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none ${currentTheme.colors.ring}`} /><button onClick={() => callGemini('chat', aiPrompt)} className={`absolute right-2 top-1/2 -translate-y-1/2 ${currentTheme.colors.text} hover:opacity-80`}><Send size={16} /></button></div>
                      </div>
                      {aiPanelOpen && <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">{isAiLoading ? (<div className="flex items-center gap-2 text-sm text-gray-500 justify-center py-4"><Loader size={16} className="animate-spin" /> Thinking...</div>) : (<div className="bg-white p-4 rounded-lg border border-gray-100 text-sm text-gray-700 leading-relaxed shadow-inner max-h-80 overflow-y-auto"><div className="flex justify-between items-center mb-2"><span className={`text-xs font-bold ${currentTheme.colors.text} uppercase`}>AI Response</span>
                      <div className="flex gap-1">
                          <button onClick={()=>{}} className="text-gray-400 hover:text-gray-600 p-1" title="Export Response"><Download size={14}/></button>
                          <button onClick={() => setAiPanelOpen(false)} className="text-gray-400 hover:text-gray-600 p-1" title="Close"><X size={14}/></button>
                      </div>
                      </div><div className="whitespace-pre-wrap">{aiResponse}</div></div>)}</div>}
                    </div>
                  )}

                  {sidebarTab === 'notes' && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm h-full flex flex-col">
                      <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-yellow-800 uppercase tracking-wider">My Notes</span><div className="flex gap-1"><button onClick={() => handleShareNote(selectedArticle.id)} className="text-yellow-700 hover:text-yellow-900 p-1" title="Share Note to App"><Share2 size={16}/></button><button onClick={() => exportNotes(false, selectedArticle.id)} className="text-yellow-700 hover:text-yellow-900 p-1" title="Export this note"><Download size={16}/></button></div></div>
                      <textarea className={`flex-1 w-full bg-white border border-yellow-200 rounded-lg p-3 text-sm text-gray-700 leading-relaxed focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none min-h-[300px]`} placeholder="Take notes here..." value={notes[selectedArticle.id] || ""} onChange={(e) => handleNoteChange(selectedArticle.id, e.target.value)}></textarea>
                      <div className="mt-2 text-xs text-yellow-700 flex items-center justify-between"><span>Auto-saved to browser</span><span>{notes[selectedArticle.id]?.length || 0} chars</span></div>
                    </div>
                  )}
                </div>
              </div>
              {/* Removed FloatingNotesWidget from here */}
          </div>
      );
  };

  const renderNotesDashboard = () => (
      <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Notes</h2>
            {Object.keys(notes).length > 0 && (
                <button onClick={() => exportNotes(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-bold hover:bg-yellow-200 transition-colors">
                    <Download size={18}/> Export All
                </button>
            )}
          </div>
          <div className="grid gap-4">
              {Object.entries(notes).map(([id, text]) => {
                  const article = articles.find(a => a.id === id);
                  const title = article ? article.title : `Unknown Article (ID: ${id})`;

                  return (
                    <div key={id} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                           <div className="font-bold text-yellow-900 text-lg flex items-center gap-2">
                              <StickyNote size={16} className="text-yellow-700" />
                              {title}
                           </div>
                           {article && (
                             <button onClick={() => handleArticleClick(article)} className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-medium transition-colors">
                               View Article
                             </button>
                           )}
                        </div>
                        <div className="whitespace-pre-wrap text-sm text-gray-700 border-t border-yellow-100 pt-2 mt-2">{text}</div>
                    </div>
                  );
              })}
              {Object.keys(notes).length === 0 && <div className="text-center py-20 text-gray-400">No notes yet.</div>}
          </div>
      </div>
  );

  const renderAdmin = () => {
    if(!isAuthenticated) return (
        <div className="max-w-sm mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                {loginStep === 'password' ? <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="w-full p-2 border rounded" placeholder="Password (*)" /> : <input value={mfaInput} onChange={e=>setMfaInput(e.target.value)} className="w-full p-2 border rounded" placeholder="Code (*)" />}
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
                <NavItem icon={Megaphone} label="Home Sections" active={adminTab === 'sections'} onClick={() => setAdminTab('sections')} theme={currentTheme} />
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
                        
                        {/* 1. IDLE STATE */}
                        {importState === 'idle' && (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors group cursor-pointer relative">
                                <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors mb-4"/>
                                <p className="text-sm text-gray-600 font-medium mb-1">Click to upload XML</p>
                                <p className="text-xs text-gray-400">Supports MediaWiki Export Format</p>
                                <input 
                                    type="file" 
                                    onChange={handleFileUpload} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".xml"
                                />
                            </div>
                        )}

                        {/* 2. ACTIVE / PAUSED STATE */}
                        {(importState === 'active' || importState === 'paused') && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="font-bold flex items-center justify-between mb-2">
                                    <span className={`flex items-center gap-2 ${importState === 'active' ? 'text-indigo-600' : 'text-amber-600'}`}>
                                        {importState === 'active' ? <Loader size={18} className="animate-spin" /> : <PauseCircle size={18} />}
                                        {importState === 'active' ? 'Importing in progress...' : 'Import Paused'}
                                    </span>
                                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{importProgress}%</span>
                                </div>
                                
                                {/* Visual Progress Bar */}
                                <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                                    <div 
                                        className={`h-3 rounded-full transition-all duration-300 ${importState === 'active' ? 'bg-indigo-500' : 'bg-amber-400'}`} 
                                        style={{ width: `${importProgress}%` }}
                                    ></div>
                                </div>

                                <div className="text-sm text-gray-500 mb-6 font-mono bg-gray-50 p-2 rounded border border-gray-100 truncate">
                                    {importStatus}
                                </div>

                                <div className="flex gap-3">
                                    {importState === 'active' ? (
                                        <button 
                                            onClick={() => { abortImportRef.current = true; }} 
                                            className="flex-1 py-2 bg-amber-100 text-amber-800 font-bold rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <PauseCircle size={18} /> Pause Import
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => { 
                                                if (pagesRef.current) { 
                                                    abortImportRef.current = false; 
                                                    setImportState('active'); 
                                                    runImport(pagesRef.current); 
                                                } 
                                            }} 
                                            className="flex-1 py-2 bg-green-100 text-green-800 font-bold rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <PlayCircle size={18} /> Resume Import
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. COMPLETED STATE */}
                        {importState === 'completed' && (
                            <div className="text-center p-8 bg-green-50 rounded-xl border border-green-200 animate-fadeIn">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-green-900 mb-2">Import Successful!</h3>
                                <p className="text-green-700 mb-6">{importStatus}</p>
                                <button 
                                    onClick={() => {
                                        setImportState('idle');
                                        setImportProgress(0);
                                        setImportStatus(null);
                                        pagesRef.current = null;
                                        importCursorRef.current = 0;
                                    }}
                                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 mx-auto"
                                >
                                    <Upload size={18} /> Import Another File
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {adminTab === 'sections' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Manage Home Sections</h2>
                        <RichTextEditor content={sectionContent} onChange={setSectionContent} theme={currentTheme} />
                        <div className="mt-4 flex gap-4">
                            <label><input type="checkbox" checked={sectionPersistent} onChange={e=>setSectionPersistent(e.target.checked)}/> Persistent</label>
                            {!sectionPersistent && <input type="date" value={sectionExpiry} onChange={e=>setSectionExpiry(e.target.value)} />}
                        </div>
                        <button onClick={handleAddSection} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Add Section</button>
                        <div className="mt-8 space-y-2">
                           {customSections.map(s => (
                               <div key={s.id} className="p-3 border rounded flex justify-between">
                                  <div className="text-sm truncate w-64">{s.content.substring(0, 50)}...</div>
                                  <button onClick={() => handleDeleteSection(s.id)} className="text-red-500"><Trash2 size={14}/></button>
                               </div>
                           ))}
                        </div>
                    </div>
                )}
                {adminTab === 'settings' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Settings</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-bold">Site Title</label><input className="w-full p-2 border rounded" value={siteTitle} onChange={e=>setSiteTitle(e.target.value)} /></div>
                            <div><label className="block text-sm font-bold">Description</label><textarea className="w-full p-2 border rounded" value={siteDescription} onChange={e=>setSiteDescription(e.target.value)} /></div>
                            
                            {/* NEW: Logo Upload with Remove */}
                            <div>
                                <label className="block text-sm font-bold mb-2">Site Logo</label>
                                <div className="flex gap-2 items-center">
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full p-2 border rounded" />
                                    {siteLogo && (
                                        <button onClick={() => setSiteLogo(null)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Remove Logo">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                {siteLogo && <img src={siteLogo} alt="Logo Preview" className="mt-2 h-12 object-contain" />}
                            </div>

                            {/* NEW: Font Selector */}
                            <div>
                                <label className="block text-sm font-bold mb-2">Font Style</label>
                                <div className="flex gap-2">
                                    {['sans', 'serif', 'mono'].map(f => (
                                        <button key={f} onClick={() => setSiteFont(f)} className={`px-3 py-1 border rounded capitalize ${siteFont === f ? 'bg-indigo-100 border-indigo-500' : ''}`}>{f}</button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* NEW: Color Selector */}
                            <div>
                                <label className="block text-sm font-bold mb-2">Theme Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {Object.keys(COLORS).map(c => (
                                        <button key={c} onClick={() => setSiteColor(c)} className={`px-3 py-1 border rounded capitalize ${siteColor === c ? 'bg-gray-200 border-gray-500' : ''}`}>{c}</button>
                                    ))}
                                </div>
                            </div>

                            {/* NEW: Category Style Selector */}
                            <div>
                                <label className="block text-sm font-bold mb-2">Category Card Style</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setCategoryStyle('gradient')} 
                                        className={`px-4 py-2 border rounded font-medium flex items-center gap-2 ${categoryStyle === 'gradient' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white hover:bg-gray-50'}`}
                                    >
                                        <Palette size={16}/> Gradients
                                    </button>
                                    <button 
                                        onClick={() => setCategoryStyle('image')} 
                                        className={`px-4 py-2 border rounded font-medium flex items-center gap-2 ${categoryStyle === 'image' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white hover:bg-gray-50'}`}
                                    >
                                        <ImageIcon size={16}/> Dynamic Images
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {categoryStyle === 'gradient' 
                                        ? "Uses colorful abstract gradients for category backgrounds." 
                                        : "Uses curated theological images based on category keywords (Bible, Church, History, etc.)."
                                    }
                                </p>
                            </div>

                            <div className="pt-4 border-t flex gap-2">
                                <button onClick={handleSaveSettings} className="px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">Save Settings</button>
                                <button onClick={() => setImageSeed(s => s + 1)} className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300">Refresh Images</button>
                                <button onClick={rebuildStats} className="px-4 py-2 bg-amber-600 text-white rounded text-sm hover:bg-amber-700">Rebuild Category Stats</button>
                            </div>
                        </div>
                    </div>
                )}
                {adminTab === 'manage' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Manage Articles</h2>
                            <button onClick={handleDeleteAll} className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 font-bold border border-red-200">Delete All Articles</button>
                        </div>
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
      {/* IMPROVED NOTIFICATION TICKER */}
      {notification && (
        <div className="fixed top-6 right-6 z-[100] animate-fadeIn">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50 backdrop-blur-sm">
            <CheckCircle className="text-emerald-400" size={20} />
            <span className="font-medium">{notification.message}</span>
            </div>
        </div>
      )}

      <header className="sticky top-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={()=>setView('home')}>
             {/* INCREASED LOGO SIZE: Changed h-10 to h-14 */}
             {siteLogo ? <img src={siteLogo} alt={siteTitle} className="h-14 object-contain" /> : <><Book/> {siteTitle}</>}
           </div>
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
      
      {/* Floating Widget Moved Here - OUTSIDE any transforms/animations */}
      {view === 'article' && selectedArticle && (
        <FloatingNotesWidget 
            article={selectedArticle} 
            noteContent={notes[selectedArticle.id] || ''} 
            onChange={(id, txt) => handleNoteChange(id, txt)} 
            onExport={() => exportNotes(false, selectedArticle.id)} 
            onShare={() => handleShareNote(selectedArticle.id)} 
            visible={showNoteWidget} 
            setVisible={setShowNoteWidget} 
            theme={currentTheme} 
        />
      )}

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