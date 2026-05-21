import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import ThreeDChatButton from './ThreeDChatButton'

// Simple markdown-style bold renderer
const renderText = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  )
}

const Message = ({ msg }) => {
  const isBot = msg.role === 'assistant'
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: 12 }}>
      {isBot && <div style={s.botAvatar}>🤖</div>}
      <div style={{ ...s.bubble, ...(isBot ? s.botBubble : s.userBubble), maxWidth: '80%' }}>
        {msg.content.split('\n').map((line, i) => (
          <div key={i} style={{ minHeight: line === '' ? 8 : 'auto' }}>
            {renderText(line)}
          </div>
        ))}
        {msg.typing && <span style={s.cursor}>▋</span>}
      </div>
    </div>
  )
}

const QUICK_REPLIES = [
  '🔍 Search trains',
  '📋 How to book?',
  '❌ Cancel booking',
  '💰 Check prices',
  '💺 Class types',
]

export default function Chatbot() {
  const { user } = useAuth()
  const [open,     setOpen]     = useState(false)
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi${user ? ' ' + user.name.split(' ')[0] : ''}! I'm **RailBot**.\n\nI can help you find trains, check prices, and guide you through booking!\n\nWhat can I help you with today?`
    }
  ])
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    // Add typing indicator
    setMessages(prev => [...prev, { role: 'assistant', content: '...', typing: true }])

    try {
      const res = await api.post('/chat', {
        message: userMsg,
        userId:  user?.id || null,
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      })

      // Replace typing indicator with real response
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'assistant', content: res.data.reply }
      ])
    } catch {
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'assistant', content: '😕 Sorry, I ran into an error. Please try again!' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `👋 Chat cleared! How can I help you?`
    }])
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={s.fab}
        title="Chat with RailBot"
        aria-label={open ? 'Close RailBot chat' : 'Open RailBot chat'}
      >
        <ThreeDChatButton active={open} size={48} />
        <span style={s.fabCopy}>
          <span style={s.fabLabel}>{open ? 'Open Chat' : 'RailBot'}</span>
          <span style={s.fabSubLabel}>{open ? 'Minimize assistant' : '3D chat assistant'}</span>
        </span>
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div style={s.window}>

          {/* Header */}
          <div style={s.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={s.headerAvatar}>🤖</div>
              <div>
                <div style={s.headerName}>RailBot</div>
                <div style={s.headerStatus}>
                  <span style={s.statusDot} />
                  Online — Railway Assistant
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={clearChat} style={s.iconBtn} title="Clear chat">🗑️</button>
              <button onClick={() => setOpen(false)} style={s.iconBtn}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div style={s.quickReplies}>
              {QUICK_REPLIES.map(q => (
                <button key={q} style={s.quickBtn} onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={s.inputRow}>
            <input
              ref={inputRef}
              style={s.input}
              placeholder="Ask about trains, prices, booking..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              style={{ ...s.sendBtn, opacity: (!input.trim() || loading) ? 0.5 : 1 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>

        </div>
      )}
    </>
  )
}

const s = {
  // FAB
  fab: {
    position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.9))',
    color: '#ffffff',
    border: '1px solid rgba(148, 163, 184, 0.28)',
    borderRadius: 999,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 16px 10px 10px',
    minWidth: 182,
    boxShadow: '0 18px 44px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.06) inset',
    backdropFilter: 'blur(18px)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    fontFamily: 'var(--font-head)',
    fontWeight: 700,
    overflow: 'hidden',
  },
  fabCopy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    gap: 1,
    lineHeight: 1.1,
  },
  fabLabel: { fontSize: 14, letterSpacing: '0.04em', textTransform: 'uppercase' },
  fabSubLabel: { fontSize: 11, fontWeight: 500, color: 'rgba(226, 232, 240, 0.8)', letterSpacing: '0.02em' },

  // Window
  window: {
    position: 'fixed', bottom: 90, right: 28, zIndex: 999,
    width: 380, height: 560,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-lit)',
    borderRadius: 16,
    boxShadow: '0 16px 64px rgba(0,0,0,0.6)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeUp 0.3s ease',
  },

  // Header
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px',
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
  },
  headerAvatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'rgba(245,166,35,0.12)',
    border: '1px solid rgba(245,166,35,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18,
  },
  headerName:   { fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 },
  headerStatus: { fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot:    { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' },
  iconBtn:      { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 15, padding: '4px 6px', borderRadius: 6 },

  // Messages
  messages: {
    flex: 1, overflowY: 'auto',
    padding: '16px 14px',
    display: 'flex', flexDirection: 'column',
  },

  // Bubbles
  bubble: {
    padding: '10px 14px', borderRadius: 12,
    fontSize: 13, lineHeight: 1.6,
    wordBreak: 'break-word',
  },
  botBubble: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '4px 12px 12px 12px',
    color: 'var(--text)',
  },
  userBubble: {
    background: 'var(--accent)',
    color: '#0a0c10',
    borderRadius: '12px 4px 12px 12px',
    fontWeight: 500,
  },
  botAvatar: { fontSize: 18, flexShrink: 0, marginTop: 2 },
  cursor:    { animation: 'pulse 1s infinite', marginLeft: 2 },

  // Quick replies
  quickReplies: {
    display: 'flex', flexWrap: 'wrap', gap: 6,
    padding: '0 12px 10px',
  },
  quickBtn: {
    background: 'var(--bg)', border: '1px solid var(--border-lit)',
    color: 'var(--text-muted)', borderRadius: 20,
    padding: '5px 12px', fontSize: 11,
    cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: 'var(--font-body)',
  },

  // Input
  inputRow: {
    display: 'flex', gap: 8,
    padding: '12px 12px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg)',
  },
  input: {
    flex: 1, background: 'var(--bg-card)',
    border: '1px solid var(--border-lit)',
    borderRadius: 20, padding: '9px 16px',
    fontSize: 13, color: 'var(--text)',
    outline: 'none', width: 'auto',
  },
  sendBtn: {
    background: 'var(--accent)', color: '#0a0c10',
    border: 'none', borderRadius: '50%',
    width: 38, height: 38, fontSize: 16,
    cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s',
  },
}