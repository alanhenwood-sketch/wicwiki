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

// --- Firebase Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

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

// --- Theme Config ---
const FONTS = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono"
};

const TEXT_SIZES = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg"
};

const COLORS = {
  indigo: { name: 'Indigo', text: 'text-indigo-600', bg: 'bg-indigo-600', bgSoft: 'bg-indigo-50', border: 'border-indigo-200', hoverText: 'hover:text-indigo-900', ring: 'focus:ring-indigo-500' },
  rose:   { name: 'Rose',   text: 'text-rose-600',   bg: 'bg-rose-600',   bgSoft: 'bg-rose-50',   border: 'border-rose-200',   hoverText: 'hover:text-rose-900',   ring: 'focus:ring-rose-500' },
  emerald:{ name: 'Emerald',text: 'text-emerald-600',bg: 'bg-emerald-600',bgSoft: 'bg-emerald-50',border: 'border-emerald-200',hoverText: 'hover:text-emerald-900',hoverBg: 'hover:bg-emerald-700', ring: 'focus:ring-emerald-500' },
  amber:  { name: 'Amber',  text: 'text-amber-600',  bg: 'bg-amber-600',  bgSoft: 'bg-amber-50',  border: 'border-amber-200',  hoverText: 'hover:text-amber-900',  ring: 'focus:ring-amber-500' },
  violet: { name: 'Violet', text: 'text-violet-600', bg: 'bg-violet-600', bgSoft: 'bg-violet-50', border: 'border-violet-200', hoverText: 'hover:text-violet-900', ring: 'focus:ring-violet-500' },
  slate:  { name: 'Slate',  text: 'text-slate-600',  bg: 'bg-slate-600',  bgSoft: 'bg-slate-50',  border: 'border-slate-200',  hoverText: 'hover:text-slate-900',  ring: 'focus:ring-slate-500' },
};

const TEXT_COLORS = {
  gray: "text-gray-600",
  slate: "text-slate-600",
  zinc: "text-zinc-600", 
  neutral: "text-neutral-600"
};

const INSPIRATIONAL_VERSES = [
  { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", ref: "John 3:16" },
  { text: "I can do all things through Christ which strengtheneth me.", ref: "Philippians 4:13" },
  { text: "The LORD is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", ref: "Proverbs 3:5" },
  { text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", ref: "Romans 8:28" },
  { text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", ref: "Joshua 1:9" },
  { text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", ref: "Isaiah 40:31" }
];

// --- Helper Functions ---
const makeId = (t) => t ? t.trim().replace(/\s+/g, '_').replace(/[^\w\-_]/g, '') : '';

// --- Helper Components ---
const NavItem = ({ icon: Icon, label, active, onClick, theme, title, colorClass, bgClass }) => {
  const textCol = colorClass || theme.colors.text;
  const bgCol = bgClass || theme.colors.bgSoft;
  const activeStyle = active ? `${bgCol} ${textCol}` : `text-gray-500 hover:bg-gray-50 hover:text-gray-900`;
  const iconStyle = active ? textCol : `text-gray-400 group-hover:${textCol}`;
  
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 md:py-2 md:px-3 text-sm font-medium rounded-lg transition-colors group w-full md:w-auto ${activeStyle}`}
      title={title || label}
    >
      <Icon size={20} className={`${iconStyle} transition-colors`} />
      <span>{label}</span>
    </button>
  );
};

const Badge = ({ children, theme, onClick }) => {
  return (
    <span 
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${theme.colors.bgSoft} ${theme.colors.text} ${onClick ? 'cursor-pointer hover:opacity-80 hover:underline' : ''}`}
      title={onClick ? "View all articles in this category" : ""}
    >
      {children}
    </span>
  );
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const ArticleSkeleton = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-6 w-2/3 mb-2" />
      <Skeleton className="h-5 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

const RichTextEditor = ({ content, onChange, theme }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      const isFocused = document.activeElement === editorRef.current;
      const currentHTML = editorRef.current.innerHTML;
      if (content !== currentHTML && (!isFocused || Math.abs(currentHTML.length - content.length) > 10)) {
         editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 ${theme.colors.ring} focus-within:border-transparent transition-shadow`}>
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        <button onClick={() => execCommand('bold')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Bold"><Bold size={16} /></button>
        <button onClick={() => execCommand('italic')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Italic"><Italic size={16} /></button>
        <button onClick={() => execCommand('underline')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Underline"><Underline size={16} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button onClick={() => execCommand('formatBlock', 'H3')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Heading"><Type size={16} /></button>
        <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Bullet List"><List size={16} /></button>
      </div>
      <div 
        ref={editorRef} 
        contentEditable 
        className={`min-h-[300px] p-4 outline-none prose prose-sm max-w-none ${theme.font}`} 
        onInput={(e) => onChange(e.currentTarget.innerHTML)} 
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

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
      if (data && data.text) {
        setText(data.text);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span 
      className={`relative group cursor-help font-bold border-b-2 border-dotted inline-block ${theme.colors.text} ${theme.colors.border}`} 
      onMouseEnter={handleMouseEnter}
    >
      {reference}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900 text-white text-sm rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
        {loading && <span className="flex items-center gap-2 text-slate-400"><span className={`w-2 h-2 rounded-full animate-pulse bg-white`}></span> Loading KJV...</span>}
        {error && <span className="text-red-400">Verse text unavailable.</span>}
        {text && <span className="block animate-fadeIn"><span className={`block mb-2 italic leading-relaxed text-slate-200 ${theme.font}`}>"{text.trim()}"</span><span className="block text-right text-xs font-bold text-gray-400 tracking-wider">KING JAMES VERSION</span></span>}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></span>
      </span>
    </span>
  );
};

const FloatingNotesWidget = ({ article, noteContent, onChange, onExport, onShare, visible, setVisible, theme }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!visible || !article) return null;

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-xl transition-all hover:scale-105 flex items-center gap-2 animate-fadeIn border-2 border-white text-white ${theme.colors.bg}`}
        title="Open Notes"
      >
        <StickyNote size={24} />
      </button>
    );
  }

  const safeContent = typeof noteContent === 'string' ? noteContent : "";

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 rounded-2xl shadow-2xl border-2 flex flex-col animate-slideUp transition-all overflow-hidden h-96 bg-yellow-50 border-yellow-200`}>
       <div className={`flex items-center justify-between p-3 border-b bg-yellow-100/80 backdrop-blur-sm border-yellow-200`}>
         <div className="flex items-center gap-2 overflow-hidden">
            <StickyNote size={16} className="text-yellow-700" />
            <h4 className={`font-bold text-yellow-900 text-sm truncate w-40 ${theme.font}`}>
              {article.title}
            </h4>
         </div>
         <div className="flex gap-1">
            <button onClick={onShare} className="p-1.5 hover:bg-yellow-200 rounded-lg text-yellow-800 transition-colors" title="Share"><Share2 size={14}/></button>
            <button onClick={onExport} className="p-1.5 hover:bg-yellow-200 rounded-lg text-yellow-800 transition-colors" title="Download"><Download size={14}/></button>
            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-yellow-200 rounded-lg text-yellow-800 transition-colors" title="Minimize"><Minimize2 size={14}/></button>
            <button onClick={() => setVisible(false)} className="p-1.5 hover:bg-yellow-200 rounded-lg text-yellow-800 transition-colors" title="Close"><X size={14}/></button>
         </div>
       </div>
       <textarea 
         className={`flex-1 w-full bg-white/50 p-4 text-sm text-gray-800 leading-relaxed focus:outline-none resize-none font-medium placeholder-yellow-800/30 ${theme.font}`}
         placeholder="Jot down your thoughts here..."
         value={safeContent}
         onChange={(e) => onChange(article.id, e.target.value)}
         autoFocus
       ></textarea>
       <div className={`p-2 bg-yellow-100/50 text-[10px] text-yellow-700 text-center border-t border-yellow-200 ${theme.font}`}>
         Saved automatically
       </div>
    </div>
  );
};

const VerseOfTheDayWidget = () => {
  const [verse, setVerse] = useState(INSPIRATIONAL_VERSES[0]);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
     const today = new Date().toDateString();
     let hash = 0;
     for (let i = 0; i < today.length; i++) hash = today.charCodeAt(i) + ((hash << 5) - hash);
     const index = Math.abs(hash) % INSPIRATIONAL_VERSES.length;
     setVerse(INSPIRATIONAL_VERSES[index]);
  }, []);

  const handleNext = () => {
    setAnimate(true);
    setTimeout(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * INSPIRATIONAL_VERSES.length);
      } while (INSPIRATIONAL_VERSES[nextIndex] === verse);
      setVerse(INSPIRATIONAL_VERSES[nextIndex]);
      setAnimate(false);
    }, 200);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden mb-8 border border-white/10">
       <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
       <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
         <div className="flex-1 text-center md:text-left">
           <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-indigo-200 text-sm font-medium uppercase tracking-widest">
              <Sparkles size={14} className="text-yellow-400" /> Verse of the Day
           </div>
           <div className={`transition-opacity duration-200 ${animate ? 'opacity-0' : 'opacity-100'}`}>
             <Quote className="inline-block text-white/20 mb-2 transform -scale-x-100" size={32} />
             <p className="text-xl md:text-2xl font-serif leading-relaxed text-white/95 italic mb-4">
                 "{verse.text}"
             </p>
             <p className="font-sans font-bold text-yellow-400">{verse.ref} <span className="text-white/40 font-normal text-xs ml-1">KJV</span></p>
           </div>
         </div>
         <button 
             onClick={handleNext}
             className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-sm font-medium transition-all group border border-white/10"
         >
             <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
             See Another
         </button>
       </div>
    </div>
  );
};


const YouTubeEmbed = ({ videoId, title }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="my-6 w-full max-w-xl mx-auto rounded-xl border border-gray-200 bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="text-amber-500 mb-2" size={32} />
        <h4 className="font-bold text-gray-800 mb-1">Video Unavailable to Embed</h4>
        <p className="text-sm text-gray-600 mb-4">You can still watch this video directly on YouTube.</p>
        <a 
          href={`https://www.youtube.com/watch?v=${videoId}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          <Play size={16} fill="currentColor" /> Watch on YouTube <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className="my-6 w-full max-w-xl mx-auto rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black flex flex-col">
      <div className="aspect-video relative w-full">
        <iframe 
          width="100%" 
          height="100%" 
          src={`https://www.youtube.com/embed/${videoId}?origin=${typeof window !== 'undefined' ? window.location.origin : ''}`} 
          title={title || "YouTube video player"}
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          onError={() => setHasError(true)}
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>
      <div className="bg-gray-50 p-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>If the video fails to play:</span>
        <a 
           href={`https://www.youtube.com/watch?v=${videoId}`} 
           target="_blank" 
           rel="noopener noreferrer"
           className="flex items-center gap-1 text-red-600 hover:underline font-medium"
        >
          Watch on YouTube <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};


const HtmlContentRenderer = ({ html, theme, onNavigate }) => {
  const verseRegex = /(\b(?:(?:1|2|3|I|II)\s*)?(?:[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?(?:\s+[A-Za-z]+)?)(?:\.|(?:\s+))\s*\d+:\d+(?:[-–,]\s*\d+)*)/g;
  const isVerseString = (str) => /^(\b(?:(?:1|2|3|I|II)\s*)?(?:[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?(?:\s+[A-Za-z]+)?)(?:\.|(?:\s+))\s*\d+:\d+(?:[-–,]\s*\d+)*)$/.test(str);
  const youtubeRegex = /((?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s]*)/g;

  const matches = [...(html || "").matchAll(youtubeRegex)];
  const allVideos = matches.map(m => m[2]); 
  const hasGallery = allVideos.length > 1;

  const renderNodes = (nodes) => {
    return Array.from(nodes).map((node, i) => {
      if (node.nodeType === 3) {
        let text = node.textContent;
        if (!text || !text.trim()) return null;
        
        if (hasGallery) {
           text = text.replace(youtubeRegex, '');
           if (!text.trim()) return null;
        } else if (allVideos.length === 1) {
           const singleMatch = text.match(youtubeRegex);
           if (singleMatch) {
             const parts = text.split(singleMatch[0]);
             return (
               <React.Fragment key={i}>
                  {parts[0] && <span>{parts[0]}</span>}
                  <YouTubeEmbed videoId={singleMatch[2]} title="Embedded Video" />
                  {parts[1] && <span>{parts[1]}</span>}
               </React.Fragment>
             );
           }
        }

        const parts = text.split(verseRegex);
        return (
          <React.Fragment key={i}>
            {parts.map((part, index) => { 
              if (isVerseString(part)) { 
                return <VerseTooltip key={`${i}-${index}`} reference={part} theme={theme} />; 
              } 
              return <span key={`${i}-${index}`}>{part}</span>; 
            })}
          </React.Fragment>
        );
      }
      if (node.nodeType === 1) {
        const tagName = node.tagName.toLowerCase();
        if (tagName === 'script' || tagName === 'style') return null;
        
        const props = { key: i };
        if (node.attributes) {
          Array.from(node.attributes).forEach(attr => {
            const validName = /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(attr.name);
            if (!validName) return;

            if (attr.name === 'class') {
              props.className = attr.value;
            } else if (attr.name === 'style') {
              // Skipping style parsing for safety
            } else {
              props[attr.name] = attr.value;
            }
          });
        }

        if (props['data-wiki-link'] && onNavigate) {
          props.onClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate(props['data-wiki-link']);
          };
          props.className = (props.className || '') + ` cursor-pointer ${theme.colors.text} hover:underline font-medium`;
        }

        if (props['data-wiki-anchor']) {
          props.onClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetId = props['data-wiki-anchor'];
            const element = document.getElementById(targetId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              console.warn(`Anchor #${targetId} not found on this page.`);
            }
          };
          props.className = (props.className || '') + ` cursor-pointer ${theme.colors.text} hover:underline font-medium`;
        }

        return React.createElement(tagName, props, node.childNodes.length > 0 ? renderNodes(node.childNodes) : null);
      }
      return null;
    });
  };

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || "", 'text/html');
    return (
      <>
        {renderNodes(doc.body.childNodes)}
        {hasGallery && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h4 className={`text-lg font-bold mb-4 ${theme.colors.text}`}>Media Gallery</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allVideos.map((id, idx) => (
                <div key={idx} className="w-full">
                   <YouTubeEmbed videoId={id} title={`Gallery Video ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  } catch (e) {
    return <p className="text-red-500">Error rendering content.</p>;
  }
};

export default function App() {
  // --- State Declarations ---
  // Reordered to prevent ReferenceErrors (using state before initialization)
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [view, setView] = useState('home');
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [limitCount, setLimitCount] = useState(50);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [customSections, setCustomSections] = useState([]);
  const [dbCategoryCounts, setDbCategoryCounts] = useState({});

  const [siteTitle, setSiteTitle] = useState("Wicwiki's Christian Knowledge Base");
  const [siteDescription, setSiteDescription] = useState("Welcome to the new digital library. Access over {{count}} articles on theology, history, and apologetics.");
  const [siteLogo, setSiteLogo] = useState(null);
  const [siteFont, setSiteFont] = useState("sans");
  const [siteTextSize, setSiteTextSize] = useState("base");
  const [siteColor, setSiteColor] = useState("indigo");
  const [siteTextColor, setSiteTextColor] = useState("gray");

  const [imageSeed, setImageSeed] = useState(() => {
    const saved = localStorage.getItem('theologue_image_seed');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [adminTab, setAdminTab] = useState('manage');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [loginStep, setLoginStep] = useState('password');
  const [mfaInput, setMfaInput] = useState("");
  
  const [editingId, setEditingId] = useState(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorCategory, setEditorCategory] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  
  const [sectionContent, setSectionContent] = useState("");
  const [sectionPersistent, setSectionPersistent] = useState(false);
  const [sectionExpiry, setSectionExpiry] = useState("");

  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('theologue_notes');
      return saved ? JSON.parse(saved) : {};
    } catch(e) {
      return {};
    }
  });
  const [showNoteWidget, setShowNoteWidget] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('ai');
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [pendingScrollAnchor, setPendingScrollAnchor] = useState(null);
  
  const [isWelcomeMinimized, setIsWelcomeMinimized] = useState(false);

  // Import State Controls
  const pagesRef = useRef(null);
  const importCursorRef = useRef(0);
  const abortImportRef = useRef(false);
  const [importState, setImportState] = useState('idle'); // 'idle' | 'active' | 'paused' | 'completed'

  // Theme Memo
  const currentTheme = useMemo(() => ({
    font: FONTS[siteFont],
    textSize: TEXT_SIZES[siteTextSize],
    colors: COLORS[siteColor],
    textColor: TEXT_COLORS[siteTextColor]
  }), [siteFont, siteTextSize, siteColor, siteTextColor]);

  // --- Firebase Auth & Data Fetching ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch Articles with LIMIT for Production Scale
    // NOTE: For 80,000 articles, we strictly limit to the most recent batch.
    // Client-side filtering of the whole DB is impossible.
    setIsLoading(true);
    const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
    
    // Switch between "Latest Articles" and "Category Specific Articles"
    let q;
    if (activeCategory) {
        // Query specific category (pagination capable)
        q = query(
            articlesRef, 
            where('category', '==', activeCategory),
            orderBy('createdAt', 'desc'), 
            limit(limitCount)
        );
    } else {
        // Default latest articles
        q = query(articlesRef, orderBy('createdAt', 'desc'), limit(limitCount));
    }
    
    const unsubscribeArticles = onSnapshot(q, (snapshot) => {
      const fetchedArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArticles(fetchedArticles);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching articles:", error);
      setIsLoading(false);
    });

    // Fetch Sections
    const sectionsRef = collection(db, 'artifacts', appId, 'public', 'data', 'sections');
    const unsubscribeSections = onSnapshot(sectionsRef, (snapshot) => {
      const fetchedSections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomSections(fetchedSections);
    }, (error) => {
      console.error("Error fetching sections:", error);
    });

    // Fetch Global Stats
    const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories');
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
        if (docSnap.exists()) {
            setDbCategoryCounts(docSnap.data());
        }
    });

    return () => {
      unsubscribeArticles();
      unsubscribeSections();
      unsubscribeStats();
    };
  }, [user, limitCount, activeCategory]);

  // Effects
  useEffect(() => { localStorage.setItem('theologue_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('theologue_image_seed', imageSeed.toString()); }, [imageSeed]);

  useEffect(() => { 
    const handleBeforeUnload = (e) => { if (Object.keys(notes).length > 0) { e.preventDefault(); e.returnValue = ''; } }; 
    window.addEventListener('beforeunload', handleBeforeUnload); 
    return () => window.removeEventListener('beforeunload', handleBeforeUnload); 
  }, [notes]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeCategory]);

  // Scroll effect
  useEffect(() => {
    if (selectedArticle && pendingScrollAnchor) {
      const timer = setTimeout(() => {
        const element = document.getElementById(pendingScrollAnchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setPendingScrollAnchor(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedArticle, pendingScrollAnchor]);

  // --- Memos (Restored activeSections!) ---
  const activeSections = useMemo(() => {
    const now = new Date();
    return customSections.filter(s => {
      if (!s.content || !s.content.trim()) return false;
      if (s.isPersistent) return true;
      if (s.expirationDate) {
        const expiry = new Date(s.expirationDate);
        expiry.setHours(23, 59, 59, 999);
        return expiry > now;
      }
      return true;
    });
  }, [customSections]);

  // Derived Category Stats (using DB counts if available, otherwise local fallback)
  const categoryStats = useMemo(() => {
    // If we have DB stats, use them
    if (Object.keys(dbCategoryCounts).length > 0) {
        return Object.entries(dbCategoryCounts)
            .sort((a, b) => b[1] - a[1]) // Sort by count descending
            .slice(0, 12); // Top 12
    }
    // Fallback to local (only useful if small dataset)
    const counts = {};
    articles.forEach(a => { const cat = a.category?.trim() || "Uncategorized"; counts[cat] = (counts[cat] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => { if (b[1] !== a[1]) return b[1] - a[1]; return a[0].localeCompare(b[0]); }).slice(0, 12);
  }, [articles, dbCategoryCounts]);

  const categories = useMemo(() => {
     // Prefer DB categories list
     if (Object.keys(dbCategoryCounts).length > 0) {
         return Object.keys(dbCategoryCounts).sort();
     }
     return Array.from(new Set(articles.map(a => a.category))).sort();
  }, [articles, dbCategoryCounts]);
  
  const filteredArticles = useMemo(() => { 
    // Since filtering is now server-side for categories, this memo mainly handles Search text
    let result = articles; 
    // If activeCategory is set, 'articles' already contains only that category from DB
    
    if (searchQuery) { 
        const lowerQ = searchQuery.toLowerCase(); 
        result = result.filter(a => a.title.toLowerCase().includes(lowerQ) || a.content.toLowerCase().includes(lowerQ)); 
    } 
    return result; 
  }, [articles, searchQuery]);
  
  const paginatedArticles = useMemo(() => { 
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE; 
    return filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE); 
  }, [filteredArticles, currentPage]);
  
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const hasNotes = Object.keys(notes).length > 0;

  const handleArticleClick = (article) => { setSelectedArticle(article); setView('article'); setAiPanelOpen(false); setAiResponse(""); setShowNoteWidget(true); setSidebarTab('ai'); setIsMenuOpen(false); };
  
  const handleNavigateByTitle = async (linkTarget) => {
    const parts = linkTarget.split('#');
    const title = parts[0];
    const anchorRaw = parts.length > 1 ? parts[1] : null;
    if (anchorRaw) { setPendingScrollAnchor(makeId(anchorRaw)); }

    const localArticle = articles.find(a => a.title.toLowerCase() === title.toLowerCase());
    if (localArticle) {
      handleArticleClick(localArticle);
      return;
    }

    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'articles'), 
        where('title', '==', title),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const fetchedArticle = { id: doc.id, ...doc.data() };
        handleArticleClick(fetchedArticle);
      } else {
        showNotification(`Article "${title}" not found.`, 'error');
      }
    } catch (e) {
      console.error(e);
      showNotification("Error searching for linked article.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => setArticleToDelete(id);
  
  const confirmDelete = async () => { 
    if (articleToDelete) { 
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', articleToDelete));
        if (selectedArticle?.id === articleToDelete) { setSelectedArticle(null); setView('home'); } 
        setArticleToDelete(null); 
        showNotification("Article deleted successfully");
      } catch (e) {
        console.error("Error deleting article: ", e);
        showNotification("Failed to delete article", "error");
      }
    } 
  };
  
  const handleLogin = (e) => { e.preventDefault(); if (loginStep === 'password') { if (passwordInput === "admin123") { setLoginStep('mfa'); setLoginError(""); showNotification("MFA Code sent: 123456", "success"); } else { setLoginError("Incorrect password"); } } else { if (mfaInput === "123456") { setIsAuthenticated(true); setLoginStep('password'); setPasswordInput(""); setMfaInput(""); setLoginError(""); } else { setLoginError("Invalid Verification Code"); } } };
  const resetEditor = () => { setEditingId(null); setEditorTitle(""); setEditorCategory(""); setEditorContent(""); };
  const handleEditClick = (article) => { setEditingId(article.id); setEditorTitle(article.title); setEditorCategory(article.category); setEditorContent(article.content || ""); setAdminTab('create'); };
  
  const handleSaveArticle = async () => { 
    const articleData = { 
      title: editorTitle, 
      category: editorCategory || "Uncategorized", 
      content: editorContent, 
      lastUpdated: new Date().toISOString().split('T')[0] 
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', editingId), articleData);
        showNotification("Article updated successfully!"); 
      } else { 
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), {
          ...articleData,
          createdAt: serverTimestamp()
        });
        showNotification("Article published successfully!"); 
      } 
      resetEditor(); 
      setAdminTab('manage'); 
    } catch (e) {
      console.error("Error saving article: ", e);
      showNotification("Failed to save article", "error");
    }
  };

  // --- XML Import Logic with Stats Calculation ---
  const handleFileUpload = (event) => { 
    const file = event.target.files[0]; 
    if (!file) return; 
    setImportStatus("Reading file..."); 
    
    const reader = new FileReader(); 
    reader.onload = (e) => { 
      try { 
        setImportStatus("Parsing XML (this may take a moment)..."); 
        const parser = new DOMParser(); 
        const xmlDoc = parser.parseFromString(e.target.result, "text/xml"); 
        const pages = xmlDoc.getElementsByTagName("page"); 
        
        pagesRef.current = pages;
        importCursorRef.current = 0;
        abortImportRef.current = false;
        setImportState('active');
        
        executeImportLoop(pages);
      } catch (err) { 
        setImportStatus("Error parsing XML."); 
        console.error(err); 
      } 
    }; 
    reader.readAsText(file); 
  };

  // Helper to re-calc stats existing in DB (Admin Tool)
  const rebuildStats = async () => {
    setImportStatus("Rebuilding Category Stats (Scanning all docs)...");
    const counts = {};
    try {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const cat = data.category || "Uncategorized";
            counts[cat] = (counts[cat] || 0) + 1;
        });

        // Save
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories'), counts);
        showNotification("Stats Rebuilt Successfully!");
        setImportStatus("Stats Rebuilt.");
    } catch (e) {
        console.error("Stats Rebuild Failed:", e);
        showNotification("Stats Rebuild Failed", "error");
    }
  };

  const executeImportLoop = async (pages) => {
    const total = pages.length;
    const limit = 100000;
    const chunkSize = 10;
    let i = importCursorRef.current;
    
    // We will accumulate counts here, then merge with existing stats at end
    let batchCounts = {}; 

    setImportStatus(`Importing... ${i} / ${Math.min(total, limit)}`);

    while (i < Math.min(total, limit)) {
      if (abortImportRef.current) {
        setImportState('paused');
        importCursorRef.current = i;
        setImportStatus(`Paused at article ${i}.`);
        return;
      }

      const chunk = Array.from(pages).slice(i, i + chunkSize);
      const batch = writeBatch(db); 
      let opsInBatch = 0;

      chunk.forEach((page) => {
        const title = page.getElementsByTagName("title")[0]?.textContent; 
        const revision = page.getElementsByTagName("revision")[0]; 
        const rawText = revision ? revision.getElementsByTagName("text")[0]?.textContent : page.getElementsByTagName("text")[0]?.textContent; 
        
        if (title && rawText) { 
          const catMatch = rawText.match(/\[\[Category:([^\]|]+)/i); 
          const extractedCategory = catMatch ? catMatch[1].trim() : "Imported"; 
          const cleanText = cleanMediaWiki(rawText); 
          
          // Track count
          batchCounts[extractedCategory] = (batchCounts[extractedCategory] || 0) + 1;

          const newDocRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'));
          batch.set(newDocRef, {
              title: title, 
              category: extractedCategory, 
              content: cleanText, 
              lastUpdated: new Date().toISOString().split('T')[0],
              createdAt: serverTimestamp()
          });
          opsInBatch++;
        }
      });

      if (opsInBatch > 0) {
        try {
          await batch.commit();
          i += chunkSize;
          importCursorRef.current = i; 
          setImportStatus(`Importing... ${Math.min(i, total)} / ${Math.min(total, limit)}`);
          await new Promise(r => setTimeout(r, 1000)); 
        } catch (batchErr) {
           console.error("Batch commit failed:", batchErr);
           if (batchErr.code === 'resource-exhausted') {
             setImportStatus(`Rate limit hit at ${i}. Pausing 10s...`);
             await new Promise(r => setTimeout(r, 10000));
           } else {
             console.warn("Skipping corrupt batch.");
             i += chunkSize;
             importCursorRef.current = i;
           }
        }
      } else {
        i += chunkSize;
        importCursorRef.current = i;
      }
    }

    // FINAL STEP: Update the global stats document
    setImportStatus("Updating Category Statistics...");
    try {
        const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'categories');
        const existingStatsSnap = await getDoc(statsRef);
        let finalCounts = existingStatsSnap.exists() ? existingStatsSnap.data() : {};
        
        // Merge new counts
        Object.entries(batchCounts).forEach(([cat, count]) => {
            finalCounts[cat] = (finalCounts[cat] || 0) + count;
        });
        
        await setDoc(statsRef, finalCounts);
        setImportState('completed');
        setImportStatus(`Success! Imported ${Math.min(total, limit)} articles.`); 
        showNotification(`Import Complete`); 
    } catch (e) {
        console.error("Failed to save stats:", e);
        setImportStatus("Import done, but stats failed to save.");
    }
  };

  const handlePauseImport = () => { abortImportRef.current = true; };
  const handleResumeImport = () => { if (pagesRef.current) { abortImportRef.current = false; setImportState('active'); executeImportLoop(pagesRef.current); } };
  const handleCancelImport = () => { abortImportRef.current = true; setImportState('idle'); pagesRef.current = null; importCursorRef.current = 0; setImportStatus(null); };

  const handleLogoUpload = (event) => { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => setSiteLogo(e.target.result); reader.readAsDataURL(file); } };

  // ... (Views)
  const renderHome = () => (
    <div className={`max-w-4xl mx-auto space-y-12 animate-fadeIn ${currentTheme.font} ${currentTheme.textSize}`}>
      <div className="text-center py-12">
        <h1 className={`text-4xl font-bold text-gray-900 mb-6`}>{siteTitle}</h1>
        
        <div className="max-w-2xl mx-auto mb-10 px-4">
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
                   <span className="truncate max-w-md">{siteDescription.replace("{{count}}", articles.length.toLocaleString())}</span>
                   <button onClick={() => setIsWelcomeMinimized(false)} className={`text-xs font-bold underline ${currentTheme.colors.text} whitespace-nowrap`}>Read More</button>
                </div>
              ) : (
                siteDescription.replace("{{count}}", articles.length.toLocaleString())
              )}
            </div>
            {!isWelcomeMinimized && (
              <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 ${currentTheme.colors.bgSoft} border-b border-r ${currentTheme.colors.border} transform rotate-45`}></div>
            )}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setView('search'); setActiveCategory(null); }} className="relative max-w-lg mx-auto">
          <input type="text" placeholder="Search the library..." className={`w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:border-indigo-500 ${currentTheme.colors.ring} outline-none transition-all`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${currentTheme.colors.text}`} size={20} />
        </form>
      </div>

      <VerseOfTheDayWidget />

      {activeSections.length > 0 && (
        <div className="space-y-8">
          {activeSections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden animate-fadeIn">
               <div className={`absolute top-0 left-0 w-2 h-full ${currentTheme.colors.bg}`}></div>
               <div className="prose prose-lg max-w-none text-gray-700">
                  <HtmlContentRenderer html={section.content} theme={currentTheme} onNavigate={handleNavigateByTitle} />
               </div>
               {!section.isPersistent && section.expirationDate && (
                 <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                   <Clock size={14}/> Expires: {section.expirationDate}
                 </div>
               )}
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><BarChart size={18} className="text-emerald-500" /> Popular Categories</h2>
        {isLoading && articles.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
             {categoryStats.map(([cat, count]) => (
                <div 
                   key={cat}
                   onClick={() => { 
                       // Server-side filtering trigger
                       setActiveCategory(cat); 
                       // Reset limits for fresh page
                       setLimitCount(50);
                       setView('search'); 
                   }}
                   className={`relative bg-white rounded-xl border border-gray-200 cursor-pointer transition-all hover:shadow-lg overflow-hidden group h-32 flex flex-col justify-end p-4`}
                   style={{ 
                      backgroundImage: `url(${getCategoryImage(cat)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                   }}
                >
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity group-hover:bg-black/60"></div>
                   <div className="relative z-10">
                     <span className="font-bold text-white text-lg block leading-tight shadow-sm">{cat}</span>
                     <span className="text-xs text-white/90 mt-1 font-mono flex items-center gap-1">
                        <FileText size={10} /> {count} Articles
                     </span>
                   </div>
                </div>
             ))}
             {categories.length > 12 && (
               <div 
                 onClick={() => { setView('search'); }} 
                 className={`bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 cursor-pointer transition-all text-center hover:bg-gray-100 flex items-center justify-center h-32`}
               >
                 <span className="font-medium text-gray-500 flex items-center gap-1">View All <ChevronRight size={14}/></span>
               </div>
             )}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Tag size={18} className="text-violet-500" /> Recently Updated</h2>
        {isLoading && articles.length === 0 ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
              {articles.slice(0, 5).map(article => (
                <div key={article.id} onClick={() => handleArticleClick(article)} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center group">
                  <div><h4 className={`font-medium text-gray-900 transition-colors ${currentTheme.colors.hoverText}`}>{article.title}</h4><p className={`text-xs ${currentTheme.textColor}`}>{article.category} • {article.lastUpdated}</p></div>
                  <ChevronRight size={16} className={`text-gray-300 ${currentTheme.colors.hoverText}`} />
                </div>
              ))}
            </div>
            {articles.length >= limitCount && (
               <button 
                  onClick={() => setLimitCount(prev => prev + 50)}
                  className={`w-full py-3 bg-white border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2`}
               >
                  {isLoading ? <Loader className="animate-spin" size={16}/> : <Plus size={16}/>}
                  Load More Articles
               </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className={`max-w-5xl mx-auto ${currentTheme.font} ${currentTheme.textSize}`}>
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.colors.text}`} size={18} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter currently loaded articles..." className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none ${currentTheme.colors.ring}`} autoFocus />
        </div>
        {activeCategory && <div className="flex items-center gap-2"><span className="text-sm text-gray-500">Filtering by:</span><span className={`flex items-center gap-1 ${currentTheme.colors.bgSoft} ${currentTheme.colors.text} px-3 py-1 rounded-full text-sm font-medium animate-fadeIn`}>{activeCategory}<button onClick={() => { setActiveCategory(null); setLimitCount(50); }} className="hover:opacity-70 ml-1"><X size={14} /></button></span></div>}
        <div className="flex justify-between items-center mt-2">
           <div className="text-sm text-gray-500">{filteredArticles.length} results (from {articles.length} loaded)</div>
           <div className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">Search only scans loaded items. Load more to widen search.</div>
        </div>
      </div>
      
      {/* Paginated Article Grid */}
      {isLoading && articles.length === 0 ? (
        <div className="grid gap-4">
           {[1,2,3,4,5].map(i => <ArticleSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4">
          {paginatedArticles.map(article => (
            <div key={article.id} onClick={() => handleArticleClick(article)} className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:${currentTheme.colors.border} cursor-pointer transition-all group`}>
              <div className="flex justify-between items-start mb-2"><h3 className={`text-xl font-medium text-gray-900 ${currentTheme.colors.hoverText}`}>{article.title}</h3><Badge theme={currentTheme}>{article.category}</Badge></div>
              <div className={`text-gray-600 line-clamp-2 text-sm leading-relaxed`} dangerouslySetInnerHTML={{ __html: article.content.substring(0, 200) + '...' }} />
            </div>
          ))}
          {paginatedArticles.length === 0 && <div className="text-center py-20 text-gray-400">No articles found matching "{searchQuery}"</div>}
        </div>
      )}

      {/* Load More Button */}
      {articles.length >= limitCount && !isLoading && (
         <div className="mt-8 mb-8">
            <button 
              onClick={() => setLimitCount(prev => prev + 50)}
              className={`w-full py-4 bg-white border-2 border-dashed border-gray-200 text-gray-500 font-bold rounded-xl hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2`}
            >
              <Plus size={20} />
              Load Next 50 Articles
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">Currently showing top {limitCount} most recent articles.</p>
         </div>
      )}

      {/* Pagination Controls (Client Side) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-8 mt-4">
          <button 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border border-gray-200 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ChevronsLeft size={18} />
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border border-gray-200 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="text-sm text-gray-600 font-medium px-4">
            Page {currentPage} of {totalPages}
          </span>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border border-gray-200 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ChevronRight size={18} />
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border border-gray-200 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}
    </div>
  );

  const renderArticle = () => {
    if (!selectedArticle) return null;
    return (
      <div className={`max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 animate-fadeIn relative ${currentTheme.font} ${currentTheme.textSize}`}>
        <div className="flex-1 bg-white min-h-[80vh] p-8 md:p-12 shadow-sm rounded-xl border border-gray-100">
          <div className="mb-8 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => setView('search')} 
                className={`text-xs flex items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors`}
              >
                <ChevronLeft size={14} /> Back
              </button>
              <Badge 
                theme={currentTheme} 
                onClick={() => {
                  setActiveCategory(selectedArticle.category);
                  // Reset limits when diving into a category
                  setLimitCount(50);
                  setView('search');
                }}
              >
                {selectedArticle.category}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h1>
            <div className="flex justify-between items-center">
              <p className={`text-sm ${currentTheme.textColor}`}>Last updated on {selectedArticle.lastUpdated}</p>
              {!showNoteWidget && <button onClick={() => setShowNoteWidget(true)} className={`text-xs flex items-center gap-1 ${currentTheme.colors.text} hover:opacity-80 font-medium`}><StickyNote size={14}/> Open Note</button>}
            </div>
          </div>
          <div className={`prose prose-lg ${currentTheme.font} ${currentTheme.textColor} max-w-none leading-relaxed`}><HtmlContentRenderer html={selectedArticle.content} theme={currentTheme} onNavigate={handleNavigateByTitle} /></div>
        </div>
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-20 flex flex-col gap-4">
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button onClick={() => setSidebarTab('ai')} className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'ai' ? `${currentTheme.colors.bgSoft} ${currentTheme.colors.text}` : 'text-gray-500 hover:text-gray-900'}`}><Sparkles size={16} className={sidebarTab === 'ai' ? 'text-fuchsia-600' : 'text-gray-400'} /> AI Assistant</button>
              <button onClick={() => setSidebarTab('notes')} className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'notes' ? `${currentTheme.colors.bgSoft} ${currentTheme.colors.text}` : 'text-gray-500 hover:text-gray-900'}`}><PenLine size={16} className={sidebarTab === 'notes' ? 'text-amber-500' : 'text-gray-400'} /> Notes</button>
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
                    <button onClick={exportAIContent} className="text-gray-400 hover:text-gray-600 p-1" title="Export Response"><Download size={14}/></button>
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
        <FloatingNotesWidget article={selectedArticle} noteContent={notes[selectedArticle.id]} onChange={handleNoteChange} onExport={() => exportNotes(false, selectedArticle.id)} onShare={() => handleShareNote(selectedArticle.id)} visible={showNoteWidget} setVisible={setShowNoteWidget} theme={currentTheme} />
      </div>
    );
  };

  const renderAdmin = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-[600px] animate-fadeIn">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-sm w-full text-center">
            <div className={`w-16 h-16 ${currentTheme.colors.bgSoft} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {loginStep === 'password' ? <Lock className={currentTheme.colors.text} size={32} /> : <Smartphone className={currentTheme.colors.text} size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
            <p className="text-gray-500 mb-6 text-sm">{loginStep === 'password' ? "Enter password to access the dashboard." : "Enter the verification code sent to your device."}</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              {loginStep === 'password' ? (
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Password (admin123)" className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none ${currentTheme.colors.ring}`} autoFocus />
                </div>
              ) : (
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={mfaInput} onChange={(e) => setMfaInput(e.target.value)} placeholder="Verification Code (123456)" className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none ${currentTheme.colors.ring}`} autoFocus maxLength={6} />
                </div>
              )}
              
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              
              <button type="submit" className={`w-full ${currentTheme.colors.bg} text-white py-2 rounded-lg font-medium hover:opacity-90 transition-colors`}>
                {loginStep === 'password' ? 'Next' : 'Verify & Login'}
              </button>
              
              {loginStep === 'mfa' && (
                <button type="button" onClick={() => { setLoginStep('password'); setLoginError(""); }} className="text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto mt-4">
                  <ArrowLeft size={14}/> Back to Password
                </button>
              )}
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className={`max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col md:flex-row ${currentTheme.font} ${currentTheme.textSize}`}>
        <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Admin Panel</h2>
            <div className="space-y-1">
              <NavItem icon={PenSquare} label="Manage Content" active={adminTab === 'manage'} onClick={() => setAdminTab('manage')} theme={currentTheme} colorClass="text-blue-600" bgClass="bg-blue-50" />
              <NavItem icon={Plus} label="Write New Article" active={adminTab === 'create'} onClick={() => { resetEditor(); setAdminTab('create'); }} theme={currentTheme} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
              <NavItem icon={Megaphone} label="Home Sections" active={adminTab === 'sections'} onClick={() => setAdminTab('sections')} theme={currentTheme} colorClass="text-rose-600" bgClass="bg-rose-50" />
              <NavItem icon={FileInput} label="Import XML" active={adminTab === 'import'} onClick={() => setAdminTab('import')} theme={currentTheme} colorClass="text-orange-600" bgClass="bg-orange-50" />
              <NavItem icon={Sliders} label="Site Settings" active={adminTab === 'settings'} onClick={() => setAdminTab('settings')} theme={currentTheme} colorClass="text-slate-600" bgClass="bg-slate-50" />
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md mt-4 transition-colors"><LogOut size={16} /> Logout</button>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {adminTab === 'manage' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-sans">Manage Articles</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={adminSearchQuery} 
                    onChange={(e) => setAdminSearchQuery(e.target.value)} 
                    placeholder="Filter loaded articles..." 
                    className={`pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none ${currentTheme.colors.ring} text-sm w-64 font-sans`} 
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider font-sans"><th className="py-3 pr-4">Title</th><th className="py-3 px-4">Category</th><th className="py-3 px-4">Date</th><th className="py-3 pl-4 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {articles
                      .filter(article => 
                        article.title.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                        article.category.toLowerCase().includes(adminSearchQuery.toLowerCase())
                      )
                      .map(article => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900 font-sans">{article.title}</td><td className="py-3 px-4 text-sm text-gray-500 font-sans">{article.category}</td><td className="py-3 px-4 text-sm text-gray-500 font-sans">{article.lastUpdated}</td>
                        <td className="py-3 pl-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleEditClick(article)} className={`${currentTheme.colors.text} p-2 hover:${currentTheme.colors.bgSoft} rounded`}><Edit size={16} /></button><button onClick={() => confirmDelete(article.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded"><Trash2 size={16} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {articles.filter(article => article.title.toLowerCase().includes(adminSearchQuery.toLowerCase()) || article.category.toLowerCase().includes(adminSearchQuery.toLowerCase())).length === 0 && (
                    <p className="text-center py-8 text-gray-500 text-sm font-sans">No articles found matching "{adminSearchQuery}" in current batch.</p>
                )}
              </div>
            </div>
          )}
          
          {/* Custom Sections Management */}
          {adminTab === 'sections' && (
            <div className="max-w-3xl">
               <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Home Page Sections</h2>
               
               <div className="space-y-6 mb-12">
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                   <h3 className="font-bold text-gray-800 mb-4">Add New Section</h3>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                       <RichTextEditor content={sectionContent} onChange={setSectionContent} theme={currentTheme} />
                       <p className="text-xs text-gray-500 mt-2">Supports Rich Text and YouTube Links (paste URL).</p>
                     </div>
                     <div className="flex flex-wrap items-center gap-6">
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input type="checkbox" checked={sectionPersistent} onChange={(e) => setSectionPersistent(e.target.checked)} className={`rounded ${currentTheme.colors.text}`} />
                         <span className="text-sm font-medium text-gray-700">Persistent (Always visible)</span>
                       </label>
                       {!sectionPersistent && (
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Expires:</span>
                            <input type="date" value={sectionExpiry} onChange={(e) => setSectionExpiry(e.target.value)} className={`p-2 border border-gray-300 rounded-lg text-sm ${currentTheme.colors.ring}`} />
                         </div>
                       )}
                     </div>
                     <button 
                       onClick={handleAddSection}
                       disabled={!sectionContent || (!sectionPersistent && !sectionExpiry)}
                       className={`px-6 py-2 ${currentTheme.colors.bg} text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                       Add Section
                     </button>
                   </div>
                 </div>

                 {/* List of sections */}
                 <div className="space-y-4">
                    {customSections.map(section => (
                      <div key={section.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="prose prose-sm max-w-none text-gray-600 line-clamp-2 mb-2">
                              <HtmlContentRenderer html={section.content} theme={currentTheme} onNavigate={handleNavigateByTitle} />
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              {section.isPersistent ? (
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Persistent</span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Expires: {section.expirationDate}</span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteSection(section.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    {customSections.length === 0 && <div className="text-center text-gray-400 py-8 italic">No custom sections added yet.</div>}
                 </div>
               </div>
            </div>
          )}

          {/* ... other admin tabs ... */}
          {adminTab === 'create' && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Article' : 'Write New Article'}</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Title</label><input className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none ${currentTheme.colors.ring}`} value={editorTitle} onChange={(e) => setEditorTitle(e.target.value)} /></div>
                
                {/* Enhanced Category Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Category</label>
                  <div className="relative">
                    <input 
                      className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none ${currentTheme.colors.ring}`}
                      placeholder="Select or type new category..." 
                      value={editorCategory} 
                      onChange={(e) => setEditorCategory(e.target.value)}
                      onFocus={() => setShowCategorySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                    />
                    {showCategorySuggestions && (
                      <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {categories.filter(c => c.toLowerCase().includes(editorCategory.toLowerCase())).map(c => (
                          <button
                            key={c}
                            onClick={() => setEditorCategory(c)}
                            className={`w-full text-left px-3 py-2 text-sm text-gray-700 hover:${currentTheme.colors.bgSoft} ${currentTheme.colors.hoverText} transition-colors font-sans`}
                          >
                            {c}
                          </button>
                        ))}
                        {editorCategory && !categories.some(c => c.toLowerCase() === editorCategory.toLowerCase()) && (
                           <div className={`px-3 py-2 text-sm ${currentTheme.colors.text} ${currentTheme.colors.bgSoft} font-medium border-t border-gray-100 flex items-center gap-2 font-sans`}>
                             <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-xs"><Plus size={10} /></span>
                             Create "{editorCategory}"
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Content</label><RichTextEditor content={editorContent} onChange={setEditorContent} theme={currentTheme} /></div>
                <button onClick={handleSaveArticle} disabled={!editorTitle || !editorContent} className={`flex items-center gap-2 ${currentTheme.colors.bg} text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-sans`}><Save size={18} /> {editingId ? 'Update Article' : 'Publish Article'}</button>
              </div>
            </div>
          )}

          {adminTab === 'import' && (
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-sans">MediaWiki Importer (Cloud)</h2>
              <p className="text-gray-500 mb-8 font-sans">Upload a standard <code className="bg-gray-100 px-1 rounded">.xml</code> export file. <br/><span className="text-xs text-orange-600 font-bold">Note: Importing 80,000+ articles will take time.</span></p>
              
              {importState === 'idle' && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                  <label className="block">
                    <span className={`${currentTheme.colors.text} ${currentTheme.colors.bgSoft} px-4 py-2 rounded-lg font-medium cursor-pointer hover:opacity-80 transition-colors font-sans`}>Select XML File</span>
                    <input type="file" accept=".xml" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <p className="text-xs text-gray-400 mt-4 font-sans">Supports large datasets (Chunked Upload)</p>
                </div>
              )}

              {importState !== 'idle' && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        {importState === 'active' ? <Loader className="animate-spin text-blue-600" size={18}/> : importState === 'paused' ? <PauseCircle className="text-amber-500" size={18}/> : <CheckCircle className="text-green-600" size={18}/>}
                        {importState === 'active' ? 'Importing...' : importState === 'paused' ? 'Import Paused' : 'Import Complete'}
                      </h4>
                      <div className="flex gap-2">
                        {importState === 'active' && (
                          <button onClick={handlePauseImport} className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200" title="Pause"><PauseCircle size={18}/></button>
                        )}
                        {importState === 'paused' && (
                          <button onClick={handleResumeImport} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Resume"><PlayCircle size={18}/></button>
                        )}
                        {importState !== 'completed' && (
                          <button onClick={handleCancelImport} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Cancel"><XCircle size={18}/></button>
                        )}
                      </div>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: pagesRef.current ? `${(importCursorRef.current / Math.min(pagesRef.current.length, 100000)) * 100}%` : '0%' }}></div>
                   </div>
                   <p className="text-xs text-gray-500 font-mono">{importStatus}</p>
                </div>
              )}
            </div>
          )}

          {adminTab === 'settings' && (
            <div className="max-w-xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Site Identity</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">Site Title</label>
                    <input type="text" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none ${currentTheme.colors.ring}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">Site Description</label>
                    <textarea 
                        value={siteDescription} 
                        onChange={(e) => setSiteDescription(e.target.value)} 
                        className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none ${currentTheme.colors.ring} h-24 resize-none`}
                        placeholder="Enter site description. Use {{count}} to insert article count."
                    />
                    <p className="text-xs text-gray-500 mt-1 font-sans">Use <code>{`{{count}}`}</code> to display the total number of articles.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">Site Logo</label>
                    <div className="flex items-start gap-6">
                      <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center"><ImageIcon className="text-gray-400 mb-2" size={32} /><span className={`text-sm ${currentTheme.colors.text} font-medium font-sans`}>Upload Logo</span><span className="text-xs text-gray-400 mt-1 font-sans">PNG, JPG, SVG up to 2MB</span></div>
                      </div>
                      {siteLogo && (
                        <div className="relative group">
                          <div className="w-32 h-32 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden"><img src={siteLogo} alt="Site Logo" className="max-w-full max-h-full object-contain" /></div>
                          <button onClick={() => setSiteLogo(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Palette size={24} /> Theme & Appearance</h2>
                   <button 
                      onClick={() => {
                        setImageSeed(prev => prev + 1);
                        showNotification("Category images refreshed");
                      }}
                      className={`text-xs flex items-center gap-1 ${currentTheme.colors.text} hover:opacity-80 font-medium`}
                   >
                     <RefreshCw size={14}/> Refresh Images
                   </button>
                </div>

                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <Database size={16}/> Database Tools
                    </h3>
                    <p className="text-xs text-amber-700 mb-3">
                        Use this to recalculate category counts if they appear incorrect or after a large manual import. This process scans all articles in the database.
                    </p>
                    <button 
                        onClick={rebuildStats}
                        className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-700 transition-colors"
                    >
                        Rebuild Category Stats
                    </button>
                </div>
                
                <div className="space-y-6">
                  {/* Font Family */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><TypeIcon size={16}/> Font Style</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['sans', 'serif', 'mono'].map(font => (
                        <button 
                          key={font}
                          onClick={() => setSiteFont(font)}
                          className={`p-3 border rounded-lg text-sm capitalize ${FONTS[font]} ${siteFont === font ? `${currentTheme.colors.border} ${currentTheme.colors.bgSoft} ${currentTheme.colors.text} ring-2 ring-offset-1 ${currentTheme.colors.ring}` : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Base Font Size</label>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-500 font-bold px-2">A</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="1" 
                        value={['sm', 'base', 'lg'].indexOf(siteTextSize)}
                        onChange={(e) => setSiteTextSize(['sm', 'base', 'lg'][e.target.value])}
                        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${currentTheme.colors.name.toLowerCase()}-600`}
                      />
                      <span className="text-lg text-gray-900 font-bold px-2">A</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">Current: {siteTextSize === 'sm' ? 'Small' : siteTextSize === 'base' ? 'Medium' : 'Large'}</p>
                  </div>

                  {/* Brand Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Brand Color</label>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(COLORS).map(colorKey => (
                        <button
                          key={colorKey}
                          onClick={() => setSiteColor(colorKey)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${siteColor === colorKey ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: 'var(--tw-bg-opacity, 1)' }} // Fallback
                        >
                          <div className={`w-8 h-8 rounded-full ${COLORS[colorKey].bg}`}></div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Used for buttons, links, and active states.</p>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Text Contrast</label>
                    <div className="grid grid-cols-4 gap-3">
                      {Object.keys(TEXT_COLORS).map(colorKey => (
                        <button
                          key={colorKey}
                          onClick={() => setSiteTextColor(colorKey)}
                          className={`p-2 border rounded-lg text-sm capitalize ${siteTextColor === colorKey ? 'border-gray-900 bg-gray-50 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className={TEXT_COLORS[colorKey]}>Aa</span> {colorKey}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-white font-sans flex flex-col ${currentTheme.font} ${currentTheme.textSize}`}>
      {notification && (
        <div className={`fixed top-24 right-8 z-[70] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fadeIn ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      {articleToDelete && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Article?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this article? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setArticleToDelete(null)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className={`flex items-center gap-2 font-bold text-xl ${currentTheme.colors.text} cursor-pointer`} onClick={() => setView('home')}>
              {siteLogo ? (
                <img src={siteLogo} alt={siteTitle} className="h-12 object-contain" />
              ) : (
                <>
                  <Book className={currentTheme.colors.text} />
                  <span>{siteTitle}</span>
                </>
              )}
            </div>
            <nav className="flex items-center gap-2">
              <NavItem icon={Layout} label="Home" active={view === 'home'} onClick={() => { setView('home'); setActiveCategory(null); }} theme={currentTheme} colorClass="text-rose-600" bgClass="bg-rose-50" />
              <NavItem icon={Search} label="Search" active={view === 'search'} onClick={() => { setView('search'); setSearchQuery(''); }} theme={currentTheme} colorClass="text-sky-600" bgClass="bg-sky-50" />
              <NavItem icon={StickyNote} label="My Notes" active={view === 'notes'} onClick={() => setView('notes')} theme={currentTheme} colorClass="text-amber-600" bgClass="bg-amber-50" />
              <NavItem icon={Settings} active={view === 'admin'} onClick={() => setView('admin')} theme={currentTheme} title="Admin Dashboard" colorClass="text-violet-600" bgClass="bg-violet-50" />
            </nav>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 ml-2">
               <div className={`w-8 h-8 rounded-full ${currentTheme.colors.bgSoft} ${currentTheme.colors.text} flex items-center justify-center font-bold text-xs`}>{isAuthenticated ? "A" : "G"}</div>
               <div className="hidden md:block text-sm"><p className="font-medium text-gray-900">{isAuthenticated ? "Admin" : "Guest"}</p></div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {view === 'home' && renderHome()}
          {view === 'search' && renderSearch()}
          {view === 'article' && renderArticle()}
          {view === 'admin' && renderAdmin()}
          {view === 'notes' && renderNotesDashboard()}
        </div>
      </main>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } 
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}