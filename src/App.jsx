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
  PauseCircle, PlayCircle, XCircle, Shuffle, TrendingUp, ArrowUpAZ, ArrowDownAZ,
  ArrowUp, ArrowDown, BookOpen, Bot, Moon, Sun, Youtube, Link as LinkIcon
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
  writeBatch,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  startAt,
  endAt
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
const GEMINI_API_KEY = ""; 

// --- HELPER FUNCTIONS ---

const compressImage = (file, maxWidth = 600, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type, quality));
      };
    };
  });
};

const parseStyleString = (styleString) => {
  if (!styleString) return {};
  return styleString.split(';').reduce((acc, style) => {
    const [key, value] = style.split(':');
    if (key && value) {
      const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelKey] = value.trim();
    }
    return acc;
  }, {});
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
    if (this.state.hasError) return <div className="p-8 text-center text-red-600">Something went wrong. Refresh?</div>;
    return this.props.children;
  }
}

// --- INITIALIZATION ---
let app, auth, db;
try {
  const envConfig = (typeof window !== 'undefined' && window.__firebase_config) ? JSON.parse(window.__firebase_config) : null;
  const configToUse = envConfig || liveFirebaseConfig;
  if (configToUse.apiKey !== "PASTE_YOUR_API_KEY_HERE") {
    app = initializeApp(configToUse);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) { console.error("Init failed:", e); }

const rawAppId = (typeof window !== 'undefined' && window.__app_id) ? window.__app_id : 'production-v1';
const appId = rawAppId.replace(/[\/\\#\?]/g, '_'); 

// --- Constants ---
const FONTS = { sans: "font-sans", serif: "font-serif", mono: "font-mono" };
const TEXT_SIZES = { sm: "text-sm", base: "text-base", lg: "text-lg" };
const COLORS = {
  indigo: { name: 'Indigo', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-600 dark:bg-indigo-500', bgSoft: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-800', hoverText: 'hover:text-indigo-900 dark:hover:text-indigo-200', ring: 'focus:ring-indigo-500' },
  rose:   { name: 'Rose',   text: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-600 dark:bg-rose-500',   bgSoft: 'bg-rose-50 dark:bg-rose-900/30',   border: 'border-rose-200 dark:border-rose-800',   hoverText: 'hover:text-rose-900 dark:hover:text-rose-200',   ring: 'focus:ring-rose-500' },
  emerald:{ name: 'Emerald',text: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-600 dark:bg-emerald-500',bgSoft: 'bg-emerald-50 dark:bg-emerald-900/30',border: 'border-emerald-200 dark:border-emerald-800',hoverText: 'hover:text-emerald-900 dark:hover:text-emerald-200',hoverBg: 'hover:bg-emerald-700', ring: 'focus:ring-emerald-500' },
  amber:  { name: 'Amber',  text: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-600 dark:bg-amber-500',  bgSoft: 'bg-amber-50 dark:bg-amber-900/30',  border: 'border-amber-200 dark:border-amber-800',  hoverText: 'hover:text-amber-900 dark:hover:text-amber-200',  ring: 'focus:ring-amber-500' },
  violet: { name: 'Violet', text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-600 dark:bg-violet-500', bgSoft: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-200 dark:border-violet-800', hoverText: 'hover:text-violet-900 dark:hover:text-violet-200', ring: 'focus:ring-violet-500' },
  slate:  { name: 'Slate',  text: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-600 dark:bg-slate-500',  bgSoft: 'bg-slate-50 dark:bg-slate-800/50',  border: 'border-slate-200 dark:border-slate-700',  hoverText: 'hover:text-slate-900 dark:hover:text-slate-200',  ring: 'focus:ring-slate-500' },
};
const TEXT_COLORS = { gray: "text-gray-600 dark:text-gray-300", slate: "text-slate-600 dark:text-slate-300", zinc: "text-zinc-600 dark:text-zinc-300", neutral: "text-neutral-600 dark:text-neutral-300" };

const POPULAR_VERSE_REFS = ["John 3:16", "Philippians 4:13", "Psalm 23:1", "Romans 8:28", "Jeremiah 29:11", "Proverbs 3:5-6", "Isaiah 40:31", "Joshua 1:9", "Romans 12:2", "Galatians 5:22-23"];
const CANONICAL_BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];

// --- Components ---
const NavItem = ({ icon: Icon, label, active, onClick, theme }) => {
  const textCol = theme.colors.text;
  const bgCol = theme.colors.bgSoft;
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? `${bgCol} ${textCol}` : `text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white`}`} title={label}>
      <Icon size={18} className={active ? textCol : "text-gray-400 dark:text-slate-500"} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};
const Badge = ({ children, theme, onClick }) => (
  <span onClick={(e) => { if (onClick) { e.stopPropagation(); onClick(); } }} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${theme.colors.bgSoft} ${theme.colors.text} ${onClick ? 'cursor-pointer hover:opacity-80 hover:underline' : ''}`} title={onClick ? "View category" : ""}>{children}</span>
);

const RichTextEditor = ({ content, onChange, theme }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (editorRef.current && (content || "") !== editorRef.current.innerHTML && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = content || "";
    }
  }, [content]);

  const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); if (editorRef.current) onChange(editorRef.current.innerHTML); };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { const base64 = await compressImage(file, 600, 0.7); exec('insertImage', base64); } 
    catch (err) { alert("Failed to upload image."); }
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInsertVideo = () => {
      const url = prompt("Enter YouTube URL:");
      if (url) exec('insertHTML', `<br/>${url}<br/>`);
  };

  return (
    <div className={`border border-gray-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm focus-within:ring-2 ${theme.colors.ring} focus-within:border-transparent`}>
      <div className="flex gap-1 p-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex-wrap items-center">
        <div className="flex gap-1 border-r border-gray-300 dark:border-slate-600 pr-2 mr-2">
            <button type="button" onClick={(e)=>{e.preventDefault(); exec('bold');}} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-slate-300"><Bold size={16}/></button>
            <button type="button" onClick={(e)=>{e.preventDefault(); exec('italic');}} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-slate-300"><Italic size={16}/></button>
            <button type="button" onClick={(e)=>{e.preventDefault(); exec('underline');}} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-slate-300"><Underline size={16}/></button>
        </div>
        <div className="flex gap-2 items-center border-r border-gray-300 dark:border-slate-600 pr-2 mr-2">
            <select onChange={(e) => exec('fontName', e.target.value)} className="text-xs p-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white w-20">
                <option value="Arial">Arial</option><option value="Courier New">Courier</option><option value="Georgia">Georgia</option><option value="Times New Roman">Times</option><option value="Verdana">Verdana</option>
            </select>
            <div className="relative group flex items-center" title="Text Color">
                <Palette size={16} className="text-gray-500 dark:text-slate-400 absolute pointer-events-none left-1"/>
                <input type="color" onChange={(e) => exec('foreColor', e.target.value)} className="w-8 h-6 pl-5 opacity-0 absolute cursor-pointer"/>
                <div className="w-6 h-4 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded ml-1"></div>
            </div>
        </div>
        <div className="flex gap-1 border-r border-gray-300 dark:border-slate-600 pr-2 mr-2">
            <button type="button" onClick={(e)=>{e.preventDefault(); exec('formatBlock','H3');}} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-slate-300"><Type size={16}/></button>
            <button type="button" onClick={(e)=>{e.preventDefault(); exec('insertUnorderedList');}} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-slate-300"><List size={16}/></button>
        </div>
        <div className="flex gap-1">
            <button type="button" onClick={() => exec('createLink', prompt("Enter URL:"))} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-slate-300"><LinkIcon size={16}/></button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-slate-300"><ImageIcon size={16}/></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
            <button type="button" onClick={handleInsertVideo} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-slate-300"><Youtube size={16}/></button>
        </div>
      </div>
      <div ref={editorRef} contentEditable className={`p-4 outline-none max-w-none text-gray-800 dark:text-slate-100 ${theme.font} text-base leading-relaxed`} style={{ minHeight: '300px' }} onInput={e => onChange(e.currentTarget.innerHTML)} />
    </div>
  );
};

const HtmlContentRenderer = ({ html, theme, onNavigate, onOpenBible }) => {
  const books = CANONICAL_BOOKS.join("|");
  const verseRegex = new RegExp(`(\\b(?:${books})\\.?\\s+\\d+:\\d+(?:[-–,]\\d+)*\\b)`, 'gi');
  const youtubeRegex = /\b(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:\S+)?/g;
  
  const renderNodes = (nodes) => Array.from(nodes).map((node, i) => {
      if (node.nodeType === 3) {
        const text = node.textContent;
        if(!text.trim()) return null;
        const parts = text.split(youtubeRegex);
        return (
          <React.Fragment key={i}>
            {parts.map((part, index) => {
               if (index % 2 === 1 && part.length === 11) return <div key={index} className="my-8 w-full max-w-3xl mx-auto overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 bg-black relative" style={{ paddingBottom: '56.25%', height: 0 }}><iframe src={`https://www.youtube.com/embed/${part}`} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen /></div>;
               const verseParts = part.split(verseRegex);
               return verseParts.map((vPart, vIndex) => {
                   if (verseRegex.test(vPart)) return <span key={`${index}-${vIndex}`} className={`cursor-pointer font-bold border-b border-dotted ${theme.colors.text}`} onClick={(e)=>{e.stopPropagation(); onOpenBible(vPart)}}>{vPart}</span>;
                   return <span key={`${index}-${vIndex}`}>{vPart}</span>;
               });
            })}
          </React.Fragment>
        );
      }
      if (node.nodeType === 1) {
        const tagName = node.tagName.toLowerCase();
        if (['script','style'].includes(tagName)) return null;
        const props = { key: i };
        if (node.attributes) Array.from(node.attributes).forEach(attr => { 
            if (attr.name === 'style') { props.style = parseStyleString(attr.value); return; }
            if (attr.name === 'class') { props.className = attr.value; return; }
            props[attr.name] = attr.value; 
        });
        let baseClass = props.className || '';
        if (tagName === 'p') baseClass += ' mb-6 leading-relaxed text-gray-800 dark:text-slate-300 text-base md:text-lg';
        if (tagName === 'h1') baseClass += ' text-3xl font-extrabold mt-10 mb-6 text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-4';
        if (tagName === 'h2') baseClass += ' text-2xl font-bold mt-8 mb-4 text-gray-800 dark:text-slate-200 border-b pb-2 border-gray-100 dark:border-slate-700';
        if (tagName === 'h3') baseClass += ' text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-slate-200';
        if (tagName === 'ul') baseClass += ' list-disc list-outside mb-6 ml-6 text-gray-700 dark:text-slate-300 space-y-2';
        if (tagName === 'ol') baseClass += ' list-decimal list-outside mb-6 ml-6 text-gray-700 dark:text-slate-300 space-y-2';
        if (tagName === 'li') baseClass += ' pl-1';
        if (tagName === 'blockquote') baseClass += ' border-l-4 border-indigo-300 dark:border-indigo-700 pl-6 py-3 my-6 italic text-gray-700 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-r-lg';
        if (tagName === 'b' || tagName === 'strong') baseClass += ' font-bold text-gray-900 dark:text-white';
        if (tagName === 'i' || tagName === 'em') baseClass += ' italic';
        props.className = baseClass;
        if (props['data-wiki-link'] && onNavigate) {
          props.onClick = (e) => { e.preventDefault(); e.stopPropagation(); onNavigate(props['data-wiki-link']); };
          props.className += ` cursor-pointer ${theme.colors.text} hover:underline font-bold bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded`;
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
    <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-8 shadow-lg text-white mb-8 border border-white/10">
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
  // CHANGED: Initialize minimized state to true so it starts collapsed
  const [isMinimized, setIsMinimized] = useState(true);
   
  if (!visible || !article) return null;
  if (isMinimized) return (<button onClick={() => setIsMinimized(false)} className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-xl transition-all hover:scale-105 flex items-center gap-2 animate-fadeIn border-2 border-white dark:border-slate-700 text-white ${theme.colors.bg}`}><StickyNote size={24} /></button>);

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 rounded-2xl shadow-2xl border-2 flex flex-col animate-slideUp transition-all overflow-hidden h-96 bg-yellow-50 dark:bg-slate-800 border-yellow-200 dark:border-slate-700`}>
       <div className={`flex items-center justify-between p-3 border-b bg-yellow-100/80 dark:bg-slate-900/80 backdrop-blur-sm border-yellow-200 dark:border-slate-700`}>
         <div className="flex items-center gap-2 overflow-hidden"><StickyNote size={16} className="text-yellow-700 dark:text-yellow-500" /><h4 className={`font-bold text-yellow-900 dark:text-yellow-100 text-sm truncate w-40 ${theme.font}`}>{article.title}</h4></div>
         <div className="flex gap-1">
            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-yellow-200 dark:hover:bg-slate-700 rounded-lg text-yellow-800 dark:text-yellow-100" title="Minimize"><Minimize2 size={14}/></button>
         </div>
       </div>
       <textarea className={`flex-1 w-full bg-white/50 dark:bg-slate-800 p-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed focus:outline-none resize-none font-medium placeholder-yellow-800/30 dark:placeholder-gray-600 ${theme.font}`} placeholder="Jot down your thoughts here..." value={noteContent} onChange={(e) => onChange(article.id, e.target.value)} autoFocus></textarea>
    </div>
  );
};

// --- AI Librarian Widget (New) ---
const AiLibrarianWidget = ({ articles, navigateTo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);

    // 1. Client-Side Keyword Fallback (Instant & Safe)
    const lowerQuery = query.toLowerCase();
    const fallbackResults = articles.filter(a => 
        (a.title && a.title.toLowerCase().includes(lowerQuery)) || 
        (a.category && a.category.toLowerCase().includes(lowerQuery)) ||
        (a.content && a.content.toLowerCase().includes(lowerQuery))
    ).slice(0, 5);

    try {
      const apiKey = GEMINI_API_KEY;
      if (!apiKey || apiKey.includes("PASTE_YOUR")) {
        setResponse(fallbackResults);
        setLoading(false);
        return;
      }

      // Simplified list for token efficiency. Limit content snippet size to keep it fast.
      // Limit to 500 items for context to prevent payload too large errors
      const articleSummary = articles.slice(0, 500).map(a => ({ 
          id: a.id, 
          title: a.title, 
          category: a.category || "Uncategorized",
          snippet: (a.content || "").replace(/<[^>]+>/g, ' ').substring(0, 150)
      }));
       
      const prompt = `
        You are a theological research librarian. User Query: "${query}".
         
        Library Index: 
        ${JSON.stringify(articleSummary)}
         
        Task: Identify the 3-5 most relevant articles. 
        If the query is broad, return the best matches. 
        If specific, find the exact match.
        Return ONLY a raw JSON array of strings (article IDs). 
        Do not include markdown formatting or explanation.
        Example: ["id_1", "id_2"]
      `;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            contents: [{ parts: [{ text: prompt }] }],
            // Add safety settings to prevent blocking
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        })
      });

      const data = await res.json();
       
      if (data.error || !data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
          console.warn("AI returned error or no text, using fallback");
          setResponse(fallbackResults);
          return;
      }

      const rawText = data.candidates[0].content.parts[0].text;
       
      // Robust Parsing: Find first '[' and last ']'
      let ids = [];
      try {
        const match = rawText.match(/\[[\s\S]*\]/);
        if (match) {
            ids = JSON.parse(match[0]);
        } else {
            ids = JSON.parse(rawText);
        }
      } catch (e) {
          console.error("Failed to parse AI response:", rawText);
          // If parse fails, use fallback
          setResponse(fallbackResults);
          return;
      }

      const matchedArticles = ids.map(id => articles.find(a => a.id === id)).filter(Boolean);
       
      // If AI found nothing, fallback to keywords
      if (matchedArticles.length === 0) {
          setResponse(fallbackResults);
      } else {
          setResponse(matchedArticles);
      }

    } catch (e) {
      console.error("Librarian Error:", e);
      setResponse(fallbackResults);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-transform hover:scale-105 flex items-center justify-center"
        title="Ask the Librarian"
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-indigo-100 dark:border-slate-700 flex flex-col h-[500px] overflow-hidden animate-slideUp">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-bold">Librarian AI</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded"><Minimize2 size={18} /></button>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-900 flex flex-col gap-3">
        <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-lg rounded-tl-none self-start text-sm text-indigo-900 dark:text-indigo-100 max-w-[85%]">
          Hello! I can help you find specific articles in the library. What are you looking for?
        </div>
        
        {loading && (
           <div className="self-center my-4 flex flex-col items-center gap-2 text-gray-400 text-xs">
             <Loader className="animate-spin" size={20} />
             <span>Searching the archives...</span>
           </div>
        )}

        {response && (
           <div className="flex flex-col gap-2 animate-fadeIn">
              {response.length > 0 ? (
                  <>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Found {response.length} results</div>
                    {response.map(a => (
                        <div 
                            key={a.id} 
                            onClick={() => navigateTo('article', a)}
                            className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all"
                        >
                            <div className="font-bold text-indigo-700 dark:text-indigo-400 text-sm mb-1">{a.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{a.category || "Uncategorized"}</div>
                        </div>
                    ))}
                  </>
              ) : (
                  <div className="text-sm text-gray-500 italic text-center p-4">
                      I couldn't find any articles matching that description. Try different keywords?
                  </div>
              )}
           </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 'verses about healing'"
            className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
          <button 
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  // --- State ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  // Replaced "articles" with targeted lists to avoid loading 80k items
  const [recentArticles, setRecentArticles] = useState([]); 
  const [searchResults, setSearchResults] = useState([]);
  const [adminArticles, setAdminArticles] = useState([]);
  const [adminLastDoc, setAdminLastDoc] = useState(null); // Cursor for admin pagination
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings
  const [siteTitle, setSiteTitle] = useState("Theologue");
  const [siteDescription, setSiteDescription] = useState("Welcome.");
  const [siteColor, setSiteColor] = useState("indigo");
  const [siteTextColor, setSiteTextColor] = useState("gray");
  const [siteFont, setSiteFont] = useState("sans");
  const [siteTextSize, setSiteTextSize] = useState("base");
  const [categoryStyle, setCategoryStyle] = useState("gradient"); 
  const [imageSeed, setImageSeed] = useState(0);
  const [siteLogo, setSiteLogo] = useState(null);
  const [siteLogoDark, setSiteLogoDark] = useState(null); 
  const [isDarkMode, setIsDarkMode] = useState(false);
   
  // Admin & Data
  const [adminTab, setAdminTab] = useState('manage');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [customSections, setCustomSections] = useState([]);
  const [dbCategoryCounts, setDbCategoryCounts] = useState({});
  const [bibleState, setBibleState] = useState({ book: "John", chapter: 1 });
  const [notes, setNotes] = useState({}); 

  // UI
  const [showNoteWidget, setShowNoteWidget] = useState(true);
  const [isWelcomeMinimized, setIsWelcomeMinimized] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('ai');
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  // Editor
  const [editingId, setEditingId] = useState(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorCategory, setEditorCategory] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [sectionContent, setSectionContent] = useState("");
  const [sectionPersistent, setSectionPersistent] = useState(false);
  const [sectionExpiry, setSectionExpiry] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const pagesRef = useRef(null);
  const importCursorRef = useRef(0);
  const abortImportRef = useRef(false);
  const abortDeleteRef = useRef(false);
  const [importState, setImportState] = useState('idle');

  const currentTheme = useMemo(() => ({
    font: FONTS[siteFont] || FONTS.sans,
    textSize: TEXT_SIZES[siteTextSize] || TEXT_SIZES.base,
    colors: COLORS[siteColor] || COLORS.indigo,
    textColor: TEXT_COLORS[siteTextColor] || TEXT_COLORS.gray
  }), [siteColor, siteFont, siteTextSize, siteTextColor]);

  // --- Effects ---
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true); document.documentElement.classList.add('dark');
    }
  }, []);

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

  // Fetch Settings & Initial Data (Lite Fetch)
  useEffect(() => {
    if (!user || !db) return;
    
    // 1. Settings
    getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global')).then(snap => {
        if(snap.exists()) {
            const d = snap.data();
            setSiteTitle(d.title || "Theologue");
            setSiteDescription(d.description || "");
            setSiteColor(d.color || "indigo");
            setSiteFont(d.font || "sans");
            setSiteLogo(d.logo);
            setSiteLogoDark(d.logoDark);
            setCategoryStyle(d.categoryStyle || "gradient");
        }
    });

    // 2. Sections
    const unsubSections = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'sections'), 
        (s) => setCustomSections(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    // 3. Stats (Category Counts)
    const unsubStats = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories'), 
        (s) => { if(s.exists()) setDbCategoryCounts(s.data()); });
    
    // 4. Recent Articles (Home Page)
    const unsubRecent = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'recent'),
        (s) => {
             if (s.exists() && s.data().items) setRecentArticles(s.data().items);
             else fetchFallbackRecent();
        });

    return () => { unsubSections(); unsubStats(); unsubRecent(); };
  }, [user]);

  const fetchFallbackRecent = async () => {
      if (!db) return;
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), orderBy("createdAt", "desc"), limit(10));
      const snap = await getDocs(q);
      setRecentArticles(snap.docs.map(d => ({id: d.id, ...d.data()})));
  };

  // --- ACTIONS ---
  
  // SERVER-SIDE SEARCH
  const performSearch = async (term, cat) => {
      if (!db) return;
      setIsLoading(true);
      setSearchResults([]);
      
      try {
          const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
          let q;
          
          if (cat) {
              // Category Filter
              q = query(articlesRef, where("category", "==", cat), limit(20));
          } else if (term) {
              // Prefix Search (Title)
              // Note: Firestore is case-sensitive for string range queries. 
              // Ideally store a lowercase 'title_lower' field for case-insensitive search.
              // For now, this searches exact case prefix.
              q = query(articlesRef, orderBy("title"), startAt(term), endAt(term + '\uf8ff'), limit(20));
          } else {
              // Default view
              q = query(articlesRef, orderBy("createdAt", "desc"), limit(20));
          }
          
          const snap = await getDocs(q);
          setSearchResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
          console.error("Search failed:", e);
          setNotification({message: "Search failed. Check console."});
      } finally {
          setIsLoading(false);
      }
  };

  // ADMIN PAGINATION FETCH
  const fetchAdminArticles = async (reset = false) => {
      if (!db) return;
      setIsLoading(true);
      try {
          const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
          let q = query(articlesRef, orderBy("createdAt", "desc"), limit(20));
          
          if (!reset && adminLastDoc) {
              q = query(articlesRef, orderBy("createdAt", "desc"), startAfter(adminLastDoc), limit(20));
          }
          
          const snap = await getDocs(q);
          const newItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          if (reset) {
              setAdminArticles(newItems);
          } else {
              setAdminArticles(prev => [...prev, ...newItems]);
          }
          setAdminLastDoc(snap.docs[snap.docs.length - 1]);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('home');
  };

  const handleNavigateByTitle = async (title) => {
    if(!db) return;
    try {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), where('title', '==', title), limit(1));
        const snap = await getDocs(q);
        if(!snap.empty) {
            const doc = snap.docs[0];
            setSelectedArticle({id: doc.id, ...doc.data()});
            setView('article');
        } else {
            setNotification({message: "Article not found"});
        }
    } catch(e) { console.error(e); }
  };

  const handleLogin = (e) => {
      e.preventDefault();
      if(passwordInput === "admin123") { 
          setIsAuthenticated(true); 
          fetchAdminArticles(true); // Load initial data on login
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
      if (editingId) { 
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', editingId), articleData); 
          // Update local list instantly
          setAdminArticles(prev => prev.map(a => a.id === editingId ? { ...a, ...articleData } : a));
          setNotification({message: "Updated!"});
      } 
      else { 
          const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), { ...articleData, createdAt: serverTimestamp() }); 
          // Prepend to local list
          setAdminArticles(prev => [{ id: docRef.id, ...articleData }, ...prev]);
          setNotification({message: "Published!"});
      }
      setEditingId(null); setEditorTitle(""); setEditorContent(""); setAdminTab('manage');
    } catch (e) { console.error(e); setNotification({message: "Save failed"}); }
  };

  const handleSaveSettings = async () => {
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), {
              title: siteTitle,
              description: siteDescription,
              color: siteColor,
              font: siteFont,
              logo: siteLogo,
              logoDark: siteLogoDark, // SAVE DARK LOGO
              categoryStyle: categoryStyle
          });
          setNotification({message: "Settings Saved!"});
      } catch(e) { console.error(e); setNotification({message: "Failed to save settings"}); }
  };

  const handleLogoUpload = async (event, type = 'light') => { 
    const file = event.target.files[0]; 
    if (file) { 
        try {
            const compressedBase64 = await compressImage(file);
            if (type === 'light') setSiteLogo(compressedBase64);
            else setSiteLogoDark(compressedBase64);
        } catch (e) {
            console.error("Compression failed", e);
        }
    } 
  };

  const handleDelete = async (id) => {
    if(confirm("Delete this article?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', id));
        setAdminArticles(prev => prev.filter(a => a.id !== id)); // Instant UI update
        setNotification({message: "Deleted"});
    }
  };

  // --- BULK OPERATIONS ---
  const handleDeleteAll = async () => {
    if(!confirm("DANGER: This deletes EVERYTHING. Are you sure?")) return;
    if(!confirm("REALLY?")) return;
    
    abortImportRef.current = true; // Stop any import
    abortDeleteRef.current = false;
    setImportStatus("Starting Deletion...");
    
    const deleteBatch = async () => {
        if (abortDeleteRef.current) return;
        
        // Fetch small batch
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), limit(200));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            setImportStatus(null);
            setNotification({message: "All Deleted."});
            setAdminArticles([]); 
            return;
        }
        
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        
        setImportStatus(`Deleting... ${snap.size} removed.`);
        setTimeout(deleteBatch, 50); // Recursive
    };
    deleteBatch();
  };

  const runImport = async (pages) => {
      if(!db) return;
      abortDeleteRef.current = true;
      abortImportRef.current = false;

      let i = importCursorRef.current;
      const total = pages.length;
      const limit = 100000;
      const BATCH_SIZE = 50; 
      
      const processBatch = async () => {
          if (abortImportRef.current) { 
              setImportState('paused'); importCursorRef.current = i; setImportStatus(`Paused at ${i}`); return; 
          }
          if (i >= Math.min(total, limit)) {
              setImportState('completed'); setImportStatus("Complete!"); setImportProgress(100); return;
          }
          
          setImportStatus(`Importing ${i} / ${total}`);
          setImportProgress(Math.min(100, Math.round((i / total) * 100)));

          const batch = writeBatch(db);
          let ops = 0;
          const chunk = Array.from(pages).slice(i, i + BATCH_SIZE); 
          
          chunk.forEach(p => {
              const title = p.getElementsByTagName("title")[0]?.textContent;
              const text = p.getElementsByTagName("text")[0]?.textContent || "";
              if(title && text) {
                  let clean = text.replace(/<!--[\s\S]*?-->/g, "").replace(/\[\[Category:[^\]]+\]\]/gi, "");
                  const ref = doc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'));
                  batch.set(ref, { title, category: "Imported", content: clean.slice(0, 5000), createdAt: serverTimestamp() });
                  ops++;
              }
          });
          
          if(ops > 0) {
              await batch.commit(); 
              i += BATCH_SIZE; 
              importCursorRef.current = i; 
              setTimeout(processBatch, 100); 
          } else { i += BATCH_SIZE; setTimeout(processBatch, 50); }
      };
      processBatch();
  };

  const rebuildStats = async () => {
     if(!db) return;
     setImportStatus("Rebuilding stats...");
     try {
         const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
         const snap = await getDocs(articlesRef); 
         const counts = {};
         snap.forEach(d => { 
             const c = d.data().category; 
             if (c) counts[c] = (counts[c]||0)+1; 
         });
         await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories'), counts);
         setImportStatus("Stats Rebuilt");
     } catch(e) { setImportStatus("Rebuild failed"); }
  };
  
  const generateRecentStats = async () => {
      if(!db) return;
      setNotification({message: "Generating cache..."});
      try {
          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), orderBy("createdAt", "desc"), limit(20));
          const snapshot = await getDocs(q);
          const items = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'recent'), { items });
          setNotification({message: "Cache generated!"});
          setRecentArticles(items); 
      } catch(e) { setNotification({message: "Failed to generate cache."}); }
  };
  
  // -- Notes --
  const handleNoteChange = (id, text) => setNotes(prev => ({ ...prev, [id]: text }));
  const handleShareNote = (id) => { if(notes[id]) { navigator.clipboard.writeText(notes[id]); setNotification({message: "Copied!"}); }};
  const exportNotes = (all = false, id = null) => {
      const content = all ? Object.entries(notes).map(([k,v]) => `ID: ${k}\n${v}`).join('\n\n') : (notes[id] || "");
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'notes.txt';
      a.click();
  };

  const handleAddSection = async () => {
      if(!sectionContent) return;
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'sections'), {
              content: sectionContent,
              isPersistent: sectionPersistent,
              expirationDate: sectionPersistent ? null : sectionExpiry,
              createdAt: serverTimestamp()
          });
          setSectionContent("");
          setNotification({message: "Section added!"});
      } catch(e) { setNotification({message: "Failed to add section"}); }
  };
  const handleDeleteSection = async (id) => {
      try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sections', id)); setNotification({message: "Deleted"}); } 
      catch(e) { setNotification({message: "Failed"}); }
  };

  const callGemini = async (promptType, customPrompt = "") => {
    if (!selectedArticle) return;
    setIsAiLoading(true); setAiResponse(""); setAiPanelOpen(true);
    const apiKey = GEMINI_API_KEY; 
    if (apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE" || !apiKey) {
      setAiResponse("Please set your Gemini API Key.");
      setIsAiLoading(false);
      return;
    }
    const cleanContent = selectedArticle.content.replace(/<[^>]+>/g, '').substring(0, 30000); 
    let userQuery = ""; 
    switch (promptType) { 
        case 'summary': userQuery = `Summarize this article: "${selectedArticle.title}":\n\n${cleanContent}`; break; 
        case 'devotional': userQuery = `Write a devotional based on: "${selectedArticle.title}". Content:\n\n${cleanContent}`; break; 
        case 'chat': userQuery = `Context: "${selectedArticle.title}". Content: ${cleanContent}\n\nQuestion: ${customPrompt}`; break; 
    } 
    
    try { 
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ contents: [{ parts: [{ text: userQuery }] }] }) 
        }); 
        const data = await response.json(); 
        setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "Error generating response."); 
    } catch (error) { setAiResponse("Error connecting to AI."); }
    setIsAiLoading(false); 
  };

  // --- VIEWS ---
  
  const renderNotesDashboard = () => (
      <div className="max-w-4xl mx-auto animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Notes</h2>
                <div className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full inline-flex items-center gap-2 mt-2 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle size={14}/> Warning: Notes are cleared when you close the tab.
                </div>
            </div>
            {Object.keys(notes).length > 0 && (
                <button onClick={() => exportNotes(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-lg font-bold hover:bg-yellow-200 dark:hover:bg-yellow-900/70 transition-colors">
                    <Download size={18}/> Export All
                </button>
            )}
          </div>
          <div className="grid gap-4">
              {Object.entries(notes).map(([id, text]) => (
                <div key={id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-900/50 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                       <div className="font-bold text-yellow-900 dark:text-yellow-100 text-lg flex items-center gap-2">
                          <StickyNote size={16} className="text-yellow-700 dark:text-yellow-400" />
                          Note for Article ID: {id}
                       </div>
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300 border-t border-yellow-100 dark:border-yellow-900/30 pt-2 mt-2">{text}</div>
                </div>
              ))}
              {Object.keys(notes).length === 0 && <div className="text-center py-20 text-gray-400 dark:text-slate-500">No notes yet.</div>}
          </div>
      </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 ${currentTheme.font} ${isDarkMode ? 'dark' : ''}`}>
      {notification && <div className="fixed top-6 right-6 z-[100] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">{notification.message}</div>}

      <header className="sticky top-0 bg-white dark:bg-slate-800 border-b z-50 border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-xl cursor-pointer text-gray-900 dark:text-white" onClick={()=>setView('home')}>
             {siteLogo ? <img src={isDarkMode && siteLogoDark ? siteLogoDark : siteLogo} className="h-20 object-contain" /> : <><Book/> {siteTitle}</>}
           </div>
           <nav className="flex gap-4">
               {['home','search','notes','admin'].map(t => <NavItem key={t} icon={t==='home'?Layout:t==='search'?Search:t==='notes'?StickyNote:Settings} label={t.charAt(0).toUpperCase()+t.slice(1)} active={view===t} onClick={()=>setView(t)} theme={currentTheme}/>)}
           </nav>
        </div>
      </header>

      <main className="p-6">
         {view === 'home' && (
             <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
                 <div className="text-center py-6">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center gap-4">
                       {siteTitle}
                    </h1>
                    <div className="w-full mb-8 px-4">
                      <div className={`relative rounded-2xl ${currentTheme.colors.bgSoft} border ${currentTheme.colors.border} shadow-sm text-center transition-all duration-300 ${isWelcomeMinimized ? 'p-4' : 'p-6'}`}>
                        <button 
                          onClick={() => setIsWelcomeMinimized(!isWelcomeMinimized)}
                          className={`absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.colors.text} opacity-50 hover:opacity-100 transition-opacity`}
                          title={isWelcomeMinimized ? "Expand" : "Minimize"}
                        >
                          {isWelcomeMinimized ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}
                        </button>

                        <div className={`${currentTheme.textColor} ${isWelcomeMinimized ? 'text-sm' : 'text-lg'} leading-relaxed font-medium`}>
                          {isWelcomeMinimized ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="truncate max-w-md">{siteDescription.replace('{{count}}', Object.values(dbCategoryCounts).reduce((a,b)=>a+b,0))}</span>
                              <button onClick={() => setIsWelcomeMinimized(false)} className={`text-xs font-bold underline ${currentTheme.colors.text} whitespace-nowrap`}>Read More</button>
                            </div>
                          ) : (
                            siteDescription.replace('{{count}}', Object.values(dbCategoryCounts).reduce((a,b)=>a+b,0))
                          )}
                        </div>
                        {!isWelcomeMinimized && (
                          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 ${currentTheme.colors.bgSoft} border-b border-r ${currentTheme.colors.border} transform rotate-45`}></div>
                        )}
                      </div>
                    </div>
                 </div>

                 <VerseOfTheDayWidget />
                 {/* Quick Search */}
                 <form onSubmit={e => {e.preventDefault(); performSearch(searchQuery, null); setView('search');}} className="relative max-w-lg mx-auto mb-8">
                    <input className="w-full pl-12 pr-4 py-4 rounded-xl border shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Search library..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"/>
                 </form>

                 {/* Categories */}
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(dbCategoryCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([cat, n]) => (
                        <div key={cat} onClick={()=>{performSearch(null, cat); setView('search');}} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:shadow-md">
                            <div className="font-bold text-gray-900 dark:text-white">{cat}</div>
                            <div className="text-xs text-gray-500">{n} Articles</div>
                        </div>
                    ))}
                 </div>

                 {/* Recent */}
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Additions</h2>
                 <div className="space-y-4">
                    {recentArticles.map(a => (
                        <div key={a.id} onClick={()=>{setSelectedArticle(a); setView('article');}} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-sm cursor-pointer flex justify-between">
                            <span className="font-medium dark:text-white">{a.title}</span>
                            <span className="text-xs text-gray-500">{a.category}</span>
                        </div>
                    ))}
                 </div>
                 
                 {/* Custom Home Sections */}
                 <div className="space-y-8 mt-12">
                    {customSections.filter(s => s.isPersistent || (s.expirationDate && new Date(s.expirationDate) > new Date())).map(s => (
                        <div key={s.id} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                             <HtmlContentRenderer html={s.content} theme={currentTheme} onNavigate={()=>{}} onOpenBible={()=>{}} />
                        </div>
                    ))}
                 </div>
             </div>
         )}

         {view === 'search' && (
             <div className="max-w-5xl mx-auto">
                 <div className="mb-6 flex gap-4">
                     <input className="flex-1 p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search titles..." onKeyDown={e => e.key==='Enter' && performSearch(searchQuery, null)} />
                     <button onClick={() => performSearch(searchQuery, null)} className="px-6 bg-indigo-600 text-white rounded-lg">Search</button>
                 </div>
                 {isLoading && <div className="text-center py-10"><Loader className="animate-spin inline"/> Loading...</div>}
                 <div className="grid gap-4">
                     {searchResults.map(a => (
                         <div key={a.id} onClick={()=>{setSelectedArticle(a); setView('article');}} className="p-6 bg-white dark:bg-slate-800 rounded-xl border hover:shadow-md cursor-pointer dark:border-slate-700">
                             <h3 className="text-lg font-bold dark:text-white">{a.title}</h3>
                             <Badge theme={currentTheme}>{a.category}</Badge>
                         </div>
                     ))}
                     {!isLoading && searchResults.length === 0 && <div className="text-center text-gray-500">No results found. Try a different term.</div>}
                 </div>
             </div>
         )}
         
         {view === 'notes' && renderNotesDashboard()}

         {view === 'admin' && (
             <div className="max-w-6xl mx-auto flex gap-8">
                 <div className="w-64 space-y-2">
                     <NavItem icon={PenTool} label="Manage Articles" active={adminTab==='manage'} onClick={()=>setAdminTab('manage')} theme={currentTheme} />
                     <NavItem icon={Plus} label="New Article" active={adminTab==='create'} onClick={()=>setAdminTab('create')} theme={currentTheme} />
                     <NavItem icon={Upload} label="Import XML" active={adminTab==='import'} onClick={()=>setAdminTab('import')} theme={currentTheme} />
                     <NavItem icon={Megaphone} label="Home Sections" active={adminTab === 'sections'} onClick={() => setAdminTab('sections')} theme={currentTheme} />
                     <NavItem icon={Settings} label="Settings" active={adminTab==='settings'} onClick={()=>setAdminTab('settings')} theme={currentTheme} />
                     <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"><LogOut size={18}/> Logout</button>
                 </div>
                 <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-xl border border-gray-200 dark:border-slate-700">
                     {!isAuthenticated ? (
                         <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto">
                             <h2 className="text-xl font-bold dark:text-white">Admin Login</h2>
                             <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" placeholder="Password (admin123)" />
                             <button className="w-full py-2 bg-indigo-600 text-white rounded">Login</button>
                         </form>
                     ) : (
                         <>
                            {adminTab === 'manage' && (
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <h2 className="text-xl font-bold dark:text-white">Articles</h2>
                                        <button onClick={handleDeleteAll} className="text-red-500 text-sm">Delete All</button>
                                    </div>
                                    <div className="space-y-2">
                                        {adminArticles.map(a => (
                                            <div key={a.id} className="flex justify-between p-2 border rounded dark:border-slate-700">
                                                <span className="truncate w-2/3 dark:text-slate-200">{a.title}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={()=>{setEditingId(a.id); setEditorTitle(a.title); setEditorContent(a.content); setAdminTab('create');}} className="text-blue-500"><Edit size={16}/></button>
                                                    <button onClick={()=>handleDelete(a.id)} className="text-red-500"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={()=>fetchAdminArticles(false)} className="mt-4 w-full py-2 bg-gray-100 dark:bg-slate-700 dark:text-white rounded">Load More</button>
                                </div>
                            )}
                            {adminTab === 'create' && (
                                <div className="space-y-4">
                                    <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" placeholder="Title" value={editorTitle} onChange={e=>setEditorTitle(e.target.value)} />
                                    <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" placeholder="Category" value={editorCategory} onChange={e=>{setEditorCategory(e.target.value); setShowCategorySuggestions(true);}} />
                                    {showCategorySuggestions && (
                                        <div className="border rounded max-h-40 overflow-y-auto dark:border-slate-600">
                                            {categories.filter(c => c.toLowerCase().includes(editorCategory.toLowerCase())).map(c => (
                                                <div key={c} onMouseDown={()=>{setEditorCategory(c); setShowCategorySuggestions(false);}} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer dark:text-slate-200">{c}</div>
                                            ))}
                                        </div>
                                    )}
                                    <RichTextEditor content={editorContent} onChange={setEditorContent} theme={currentTheme} />
                                    <button onClick={handleSaveArticle} className="px-6 py-2 bg-indigo-600 text-white rounded">Save</button>
                                </div>
                            )}
                            {adminTab === 'import' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4 dark:text-white">Import XML</h2>
                                    {importState === 'idle' ? (
                                        <input type="file" onChange={(e)=>{e.persist(); if(e.target.files[0]){const r=new FileReader(); r.onload=(ev)=>{pagesRef.current=new DOMParser().parseFromString(ev.target.result,"text/xml").getElementsByTagName("page"); setImportState('active'); runImport(pagesRef.current);}; r.readAsText(e.target.files[0]);}}} />
                                    ) : (
                                        <div>
                                            <div className="mb-2 font-bold dark:text-white">{importStatus}</div>
                                            <div className="w-full bg-gray-200 rounded h-2"><div className="bg-blue-600 h-2 rounded" style={{width: `${importProgress}%`}}></div></div>
                                            <div className="flex gap-2 mt-4">
                                                <button onClick={()=>{abortImportRef.current=true}} className="px-4 py-2 bg-amber-500 text-white rounded">Pause</button>
                                                <button onClick={()=>{abortImportRef.current=false; setImportState('active'); runImport(pagesRef.current)}} className="px-4 py-2 bg-green-600 text-white rounded">Resume</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {adminTab === 'settings' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold mb-4 dark:text-white">Settings</h2>
                                    <div><label className="block text-sm font-bold dark:text-slate-300">Site Title</label><input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={siteTitle} onChange={e=>setSiteTitle(e.target.value)} /></div>
                                    <div><label className="block text-sm font-bold dark:text-slate-300">Description</label><textarea className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={siteDescription} onChange={e=>setSiteDescription(e.target.value)} /></div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 dark:text-slate-300">Site Logo (Light)</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'light')} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" />
                                            {siteLogo && <button onClick={() => setSiteLogo(null)} className="p-2 bg-red-100 text-red-600 rounded"><Trash2 size={18}/></button>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 dark:text-slate-300">Site Logo (Dark)</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'dark')} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" />
                                            {siteLogoDark && <button onClick={() => setSiteLogoDark(null)} className="p-2 bg-red-100 text-red-600 rounded"><Trash2 size={18}/></button>}
                                        </div>
                                    </div>

                                    {/* RESTORED: Font Selector */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2 dark:text-slate-300">Font Style</label>
                                        <div className="flex gap-2">
                                            {Object.keys(FONTS).map(f => (
                                                <button key={f} onClick={() => setSiteFont(f)} className={`px-3 py-1 border rounded capitalize ${siteFont === f ? 'bg-indigo-100 border-indigo-500 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-white dark:bg-slate-700 dark:text-slate-300'}`}>{f}</button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* RESTORED: Theme Color Selector */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2 dark:text-slate-300">Theme Color</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {Object.keys(COLORS).map(c => (
                                                <button key={c} onClick={() => setSiteColor(c)} className={`px-3 py-1 border rounded capitalize ${siteColor === c ? 'bg-gray-200 border-gray-500 text-gray-900 dark:bg-slate-600 dark:text-white' : 'bg-white dark:bg-slate-700 dark:text-slate-300'}`}>{c}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* RESTORED: Maintenance Section */}
                                     <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                                        <h3 className="font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Database size={16}/> Database Maintenance</h3>
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-amber-900 dark:text-amber-100 text-sm">Category Statistics</div>
                                                    <div className="text-xs text-amber-700 dark:text-amber-300">Recalculates category counts shown on home page.</div>
                                                </div>
                                                <button onClick={rebuildStats} className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 font-medium">Rebuild Categories</button>
                                            </div>
                                            <div className="h-px bg-amber-200/50 dark:bg-amber-800/50"></div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-amber-900 dark:text-amber-100 text-sm">Recent Articles Cache</div>
                                                    <div className="text-xs text-amber-700 dark:text-amber-300">Generates the 'Recent' list for fast home page loading.</div>
                                                </div>
                                                <button onClick={generateRecentStats} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium">Generate Cache</button>
                                            </div>
                                        </div>
                                     </div>

                                    <div className="flex gap-2 mt-4">
                                        <button onClick={handleSaveSettings} className="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Save Settings</button>
                                        <button onClick={() => setImageSeed(s => s + 1)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-slate-600 dark:text-white">Refresh Images</button>
                                    </div>
                                </div>
                            )}
                            {adminTab === 'sections' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold mb-4 dark:text-white">Home Sections</h2>
                                    <RichTextEditor content={sectionContent} onChange={setSectionContent} theme={currentTheme} />
                                    <div className="flex gap-4 items-center">
                                        <label className="flex items-center gap-2 dark:text-white"><input type="checkbox" checked={sectionPersistent} onChange={e=>setSectionPersistent(e.target.checked)}/> Persistent</label>
                                        {!sectionPersistent && <input type="date" value={sectionExpiry} onChange={e=>setSectionExpiry(e.target.value)} className="p-1 border rounded dark:bg-slate-700 dark:text-white" />}
                                    </div>
                                    <button onClick={handleAddSection} className="px-4 py-2 bg-blue-600 text-white rounded">Add Section</button>
                                    <div className="mt-4 space-y-2">
                                        {customSections.map(s => (
                                            <div key={s.id} className="p-2 border rounded flex justify-between dark:border-slate-700">
                                                <span className="truncate w-2/3 dark:text-slate-300">{s.content.replace(/<[^>]+>/g, '')}</span>
                                                <button onClick={()=>handleDeleteSection(s.id)} className="text-red-500"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                         </>
                     )}
                 </div>
             </div>
         )}

         {view === 'article' && selectedArticle && (
             <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow border border-gray-100 dark:border-slate-700 animate-fadeIn relative flex gap-8">
                 <div className="flex-1">
                     <button onClick={()=>setView('search')} className="mb-6 flex items-center gap-2 text-gray-500"><ArrowLeft size={16}/> Back</button>
                     <h1 className="text-4xl font-bold mb-4 dark:text-white">{selectedArticle.title}</h1>
                     <Badge theme={currentTheme}>{selectedArticle.category}</Badge>
                     <div className="mt-8 prose max-w-none dark:text-slate-300">
                         <HtmlContentRenderer html={selectedArticle.content} theme={currentTheme} onNavigate={handleNavigateByTitle} onOpenBible={handleOpenBible} />
                     </div>
                 </div>
                 
                 {/* Sidebar Restored */}
                 <div className="w-80 flex-shrink-0 space-y-4">
                     <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                        {['ai','bible','notes'].map(t => <button key={t} onClick={()=>setSidebarTab(t)} className={`flex-1 p-2 rounded capitalized text-sm ${sidebarTab===t ? 'bg-white dark:bg-slate-600 shadow' : 'text-gray-500'}`}>{t.toUpperCase()}</button>)}
                     </div>
                     {sidebarTab === 'ai' && (
                         <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl space-y-4">
                             <button onClick={()=>callGemini('summary')} className="w-full p-2 bg-white dark:bg-slate-600 rounded text-sm text-left">📝 Summarize</button>
                             <button onClick={()=>callGemini('devotional')} className="w-full p-2 bg-white dark:bg-slate-600 rounded text-sm text-left">🙏 Devotional</button>
                             <div>
                                 <input className="w-full p-2 border rounded dark:bg-slate-600 dark:text-white text-sm" placeholder="Ask AI..." value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} />
                                 <button onClick={()=>callGemini('chat', aiPrompt)} className="mt-2 w-full bg-indigo-600 text-white p-2 rounded text-sm">Ask</button>
                             </div>
                             {aiPanelOpen && <div className="mt-4 p-2 bg-white dark:bg-slate-600 rounded text-sm max-h-60 overflow-y-auto whitespace-pre-wrap dark:text-slate-200">{isAiLoading ? "Thinking..." : aiResponse}</div>}
                         </div>
                     )}
                     {sidebarTab === 'bible' && <BibleReader theme={currentTheme} book={bibleState.book} chapter={bibleState.chapter} setBook={b=>setBibleState(s=>({...s, book:b}))} setChapter={c=>setBibleState(s=>({...s, chapter:c}))} />}
                     {sidebarTab === 'notes' && (
                        <div className="bg-yellow-50 dark:bg-slate-700 p-4 rounded-xl h-full">
                            <div className="text-xs font-bold text-yellow-800 mb-2">SESSION NOTES</div>
                            <textarea className="w-full h-64 p-2 bg-white dark:bg-slate-600 rounded border border-yellow-200 text-sm" value={notes[selectedArticle.id]||""} onChange={e=>handleNoteChange(selectedArticle.id, e.target.value)}></textarea>
                            <button onClick={()=>handleShareNote(selectedArticle.id)} className="mt-2 text-xs text-blue-600 underline">Copy Note</button>
                        </div>
                     )}
                 </div>
             </div>
         )}
      </main>
    </div>
  );
}

function AppWrapper() { return <ErrorBoundary><App /></ErrorBoundary>; }
export default AppWrapper;