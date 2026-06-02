import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { docs, type DocChunk } from '../../data/llmd-docs'

/* ─── Types ─── */

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/* ─── Keyword matching ─── */

function findRelevantDocs(query: string, topN = 5): DocChunk[] {
  const lowerQuery = query.toLowerCase()
  const queryWords = lowerQuery.split(/\s+/)

  const scored = docs.map((chunk) => {
    let score = 0
    for (const keyword of chunk.keywords) {
      const lowerKeyword = keyword.toLowerCase()
      if (lowerQuery.includes(lowerKeyword)) {
        score += 2
      } else {
        for (const word of queryWords) {
          if (word.length > 2 && lowerKeyword.includes(word)) {
            score += 1
          }
        }
      }
    }
    return { chunk, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topN).filter((s) => s.score > 0).map((s) => s.chunk)
}

/* ─── API key management ─── */

const STORAGE_KEY = 'llmd-groq-api-key'

function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function storeApiKey(key: string) {
  try {
    localStorage.setItem(STORAGE_KEY, key)
  } catch {
    // localStorage unavailable
  }
}

/* ─── API call ─── */

const SYSTEM_PROMPT = `You are the llm-d documentation assistant. You ONLY answer questions based on the official llm-d documentation provided below. If the question cannot be answered from this documentation, politely say so and suggest: the official docs at https://llm-d.ai, the GitHub repo at https://github.com/llm-d/llm-d, or the community Slack. Do not make up information. Be concise and helpful. Always cite which part of the documentation your answer comes from.`

async function callGroq(
  messages: Message[],
  relevantDocs: DocChunk[],
  apiKey: string
): Promise<string> {
  const contextText = relevantDocs
    .map((d) => `--- ${d.topic} ---\n${d.content}`)
    .join('\n\n')

  const systemMessage = `${SYSTEM_PROMPT}\n\n--- DOCUMENTATION CONTEXT ---\n${contextText}\n--- END CONTEXT ---`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const status = response.status
    if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    }
    if (status === 401) {
      throw new Error('Invalid API key. Please check your Groq API key and try again.')
    }
    throw new Error(`API request failed with status ${status}. Please try again.`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response received.'
}

/* ─── Render message content with newlines ─── */

function renderContent(content: string) {
  const lines = content.split('\n')
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))
}

/* ─── Component ─── */

export default function DocChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiKey, setApiKey] = useState(() => {
    const envKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
    return envKey || getStoredApiKey()
  })
  const [apiKeyInput, setApiKeyInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const hasApiKey = apiKey.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSaveApiKey() {
    const trimmed = apiKeyInput.trim()
    if (trimmed) {
      setApiKey(trimmed)
      storeApiKey(trimmed)
      setApiKeyInput('')
    }
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading || !hasApiKey) return

    const userMessage: Message = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setError('')
    setIsLoading(true)

    try {
      const relevantDocs = findRelevantDocs(trimmed, 5)
      const reply = await callGroq(updatedMessages, relevantDocs, apiKey)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /* ─── Styles ─── */

  const triggerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#EE0000',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    zIndex: 9999,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '92px',
    right: '24px',
    width: '420px',
    maxWidth: 'calc(100vw - 48px)',
    height: '560px',
    maxHeight: 'calc(100vh - 120px)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    zIndex: 9999,
    fontFamily: 'var(--font-body)',
    backgroundColor: '#fff',
  }

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#151515',
    color: '#fff',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexShrink: 0,
  }

  const messagesAreaStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }

  const inputAreaStyle: React.CSSProperties = {
    borderTop: '1px solid #E0E0E0',
    padding: '12px 16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    flexShrink: 0,
    backgroundColor: '#fff',
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={triggerStyle}
        aria-label={isOpen ? 'Close chat' : 'Open docs chat'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', lineHeight: '22px' }}>
                llm&#x2011;d Docs Assistant
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                Trained on official llm&#x2011;d documentation
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                padding: '4px',
                lineHeight: 1,
              }}
              aria-label="Close chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* API key input (if no key set) */}
          {!hasApiKey && (
            <div
              style={{
                padding: '12px 20px',
                backgroundColor: '#FFFDE7',
                borderBottom: '1px solid #E0E0E0',
                fontSize: '13px',
                color: '#333',
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                Enter your free Groq API key to enable the chatbot.{' '}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#EE0000', textDecoration: 'underline' }}
                >
                  Get a free key at console.groq.com
                </a>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="gsk_..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveApiKey()
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: '1px solid #CCC',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <button
                  onClick={handleSaveApiKey}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: '#EE0000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Messages area */}
          <div style={messagesAreaStyle}>
            {/* Welcome message */}
            {messages.length === 0 && (
              <div
                style={{
                  backgroundColor: '#fff',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: '#333',
                  border: '1px solid #E8E8E8',
                }}
              >
                Hi! I can answer questions about llm&#x2011;d based on the official
                documentation. Try asking about routing policies, disaggregated
                serving, KV cache management, or how to get started.
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.role === 'user' ? '#F0F0F0' : '#fff',
                    border: msg.role === 'assistant' ? '1px solid #E8E8E8' : 'none',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: '#212121',
                    wordBreak: 'break-word',
                  }}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8E8E8',
                    padding: '12px 16px',
                    borderRadius: '12px 12px 12px 2px',
                    fontSize: '14px',
                    color: '#999',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ animation: 'llmd-dot-pulse 1.4s infinite both', animationDelay: '0s' }}>.</span>
                  <span style={{ animation: 'llmd-dot-pulse 1.4s infinite both', animationDelay: '0.2s' }}>.</span>
                  <span style={{ animation: 'llmd-dot-pulse 1.4s infinite both', animationDelay: '0.4s' }}>.</span>
                  <style>{`
                    @keyframes llmd-dot-pulse {
                      0%, 80%, 100% { opacity: 0.3; }
                      40% { opacity: 1; }
                    }
                  `}</style>
                  <span style={{ marginLeft: '6px' }}>Thinking</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                style={{
                  backgroundColor: '#FFF0F0',
                  border: '1px solid #FFCCCC',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  lineHeight: '20px',
                  color: '#CC0000',
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSend} style={inputAreaStyle}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasApiKey ? 'Ask about llm-d...' : 'Enter your API key above first'}
              disabled={!hasApiKey || isLoading}
              rows={1}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #D0D0D0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                resize: 'none',
                outline: 'none',
                lineHeight: '20px',
                maxHeight: '80px',
                overflowY: 'auto',
                backgroundColor: hasApiKey ? '#fff' : '#F5F5F5',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !hasApiKey}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: !input.trim() || isLoading || !hasApiKey ? '#CCC' : '#EE0000',
                border: 'none',
                cursor: !input.trim() || isLoading || !hasApiKey ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background-color 0.2s ease',
              }}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
