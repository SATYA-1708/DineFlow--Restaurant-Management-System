import React, { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  MessageSquare,
  Send,
  X,
  CheckCheck,
  Check,
  ChefHat,
  Shield
} from 'lucide-react'

export default function ChatBox({ orderId, onClose }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const endRef = useRef(null)
  const pollRef = useRef(null)

  const load = async () => {
    try {
      const r = await chatAPI.getMessages(orderId)
      setMessages(r.data.data || [])
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    pollRef.current = setInterval(load, 3000)
    return () => clearInterval(pollRef.current)
  }, [orderId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async e => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await chatAPI.sendMessage(orderId, text.trim())
      setText('')
      await load()
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const isMe = msg => msg.senderId === user?.id

  return (
    <div
      style={{
        width: '360px',
        height: '480px',
        background: '#ffffff',
        borderRadius: '18px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2000,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        animation: 'modalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* ── Chat Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)'
            }}
          >
            <MessageSquare size={18} />
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '13.5px' }}>
              Order #ORD-{String(orderId).padStart(4, '0')}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Live Staff Desk
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#cbd5e1',
            borderRadius: '6px',
            width: '26px',
            height: '26px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Messages Feed ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'var(--bg)'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '80px', fontSize: '13px' }}>
            Connecting...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '80px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-light)',
                marginBottom: '10px'
              }}
            >
              <MessageSquare size={22} />
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>No messages yet</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Send a note to kitchen or service staff.</div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe(msg) ? 'flex-end' : 'flex-start'
              }}
            >
              {!isMe(msg) && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {msg.senderRole === 'ADMIN' ? <Shield size={11} color="#dc2626" /> : <ChefHat size={11} color="#d97706" />}
                  {msg.senderName} ({msg.senderRole})
                </div>
              )}
              <div
                style={{
                  maxWidth: '80%',
                  padding: '9px 13px',
                  borderRadius: isMe(msg) ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isMe(msg) ? 'var(--primary-gradient)' : '#ffffff',
                  color: isMe(msg) ? '#ffffff' : 'var(--text)',
                  fontSize: '13px',
                  lineHeight: '1.45',
                  boxShadow: isMe(msg) ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'var(--shadow-xs)',
                  border: isMe(msg) ? 'none' : '1px solid var(--border-light)'
                }}
              >
                {msg.message}
              </div>
              <div
                style={{
                  fontSize: '10.5px',
                  color: 'var(--text-light)',
                  marginTop: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  paddingRight: '2px'
                }}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMe(msg) && (msg.isRead ? <CheckCheck size={12} color="#10b981" /> : <Check size={12} />)}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* ── Message Input ── */}
      <form
        onSubmit={send}
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '8px',
          background: '#ffffff'
        }}
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message to staff..."
          className="form-input"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '9999px',
            fontSize: '13px'
          }}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="btn btn-primary"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            padding: 0,
            flexShrink: 0
          }}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
