
'use client'
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BsChatDotsFill, BsX, BsSendFill, BsRobot, BsPersonCircle, BsExclamationTriangleFill } from 'react-icons/bs';
import './chatbot.css';
import { API_BASE_URL } from '@/service/apiConfig';

interface Message {
  from: 'ai' | 'user';
  text: string;
  time: string;
}

const PREDEFINED_QUESTIONS = [
  {
    id: 1,
    question: 'كيف أجمع النقاط؟',
    answer: 'يمكنك جمع النقاط من خلال المشاركة في الأعمال التطوعية، رفع التقارير، والتفاعل مع المبادرات المختلفة المتاحة في المنصة.'
  },
  {
    id: 2,
    question: 'كيف أرفع أعمالي؟',
    answer: 'لرفع أعمالك، انتقل إلى صفحة "رفع الأعمال"، اختر نوع العمل، أرفق الملفات المطلوبة، ثم اضغط على زر الإرسال.'
  },
  {
    id: 3,
    question: 'متى تظهر النتائج؟',
    answer: 'تظهر النتائج عادةً في لوحة المتصدرين (Leaderboard) بعد مراجعة الأعمال المرفوعة من قبل الإدارة، وتحديثها بشكل دوري.'
  },
  {
    id: 4,
    question: 'ما هي الجوائز المتاحة؟',
    answer: 'الجوائز تشمل شهادات تقدير، نقاط إضافية ترفع رتبتك في المنصة، وتكريمات خاصة للمتميزين في سباق الخير.'
  }
];

export default function ChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'ai',
      text: 'أهلاً بك في مساعد إيجي هيرو! 👋\nيمكنك الضغط على أي سؤال أدناه للحصول على إجابة، أو الضغط على "تبليغ عن مشكلة" للتواصل معنا.',
      time: ""
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplaintMode, setIsComplaintMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages(prev => prev.map((msg, idx) => idx === 0 ? {
      ...msg,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    } : msg));
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Hide on auth pages — moved AFTER all hooks to fix rules-of-hooks
  if (pathname === '/login' || pathname === '/register') return null;

  const handleQuestionClick = (q: typeof PREDEFINED_QUESTIONS[0]) => {
    if (isTyping) return;
    
    const userMsg: Message = {
      from: 'user',
      text: q.question,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        from: 'ai',
        text: q.answer,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 600);
  };

  const sendComplaint = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      from: 'user',
      text: `[بلاغ]: ${input.trim()}`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const complaintText = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      await fetch('https://egyhero.social/api/docs/Complaint/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: complaintText })
      });

      setIsTyping(false);
      setIsComplaintMode(false);
      
      setMessages(prev => [...prev, {
        from: 'ai',
        text: 'شكراً لك! تم إرسال بلاغك للإدارة بنجاح. سنقوم بمراجعته في أقرب وقت.',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        from: 'ai',
        text: 'عذراً، حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى لاحقاً.',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const sendMessage = async () => {
    if (isComplaintMode) {
      sendComplaint();
      return;
    }

    if (!input.trim()) return;

    const userMsg: Message = {
      from: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const question = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            from: 'ai',
            text: data.reply,
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }]);
        }, 800);
      } else {
        throw new Error("Server error");
      }
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        from: 'ai',
        text: 'عذراً، حدث خطأ في الاتصال. يمكنك تجربة اختيار سؤال من الأسئلة الجاهزة.',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return (
    <div className="chatbot-container" dir="rtl">
      {/* Floating Button */}
      <button
        className={`chatbot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="مساعد إيجي هيرو"
      >
        {isOpen ? <BsX size={28} /> : <BsChatDotsFill size={28} />}
        {!isOpen && messages.length > 1 && (
          <span className="unread-dot" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-info">
              <div className="bot-avatar-header">
                <BsRobot size={22} />
              </div>
              <div>
                <h4>مساعد إيجي هيرو</h4>
                <span className="status-dot">● متصل الآن</span>
              </div>
            </div>
            <button className="close-chat" onClick={() => setIsOpen(false)}><BsX size={22} /></button>
          </div>

          {/* Messages */}
          <div className="messages-area">
            {messages.map((msg, i) => (
              <div key={i} className={`message-wrap ${msg.from === 'user' ? 'user-wrap' : 'ai-wrap'}`}>
                {msg.from === 'ai' && (
                  <div className="msg-avatar"><BsRobot size={16} /></div>
                )}
                <div className="msg-bubble-group">
                  <div className={`msg-bubble ${msg.from === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                    {msg.text.split('\n').map((line, j) => (
                      <span key={j}>{line}{j < msg.text.split('\n').length - 1 ? <br/> : null}</span>
                    ))}
                  </div>
                  <div className="msg-time">{msg.time}</div>
                </div>
                {msg.from === 'user' && (
                  <div className="msg-avatar user-av"><BsPersonCircle size={16} /></div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message-wrap ai-wrap">
                <div className="msg-avatar"><BsRobot size={16} /></div>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            {/* Predefined Questions Area */}
            {!isComplaintMode && (
              <div className="quick-actions">
                <p className="quick-actions-title">الأسئلة الشائعة:</p>
                <div className="questions-grid">
                  {PREDEFINED_QUESTIONS.map(q => (
                    <button 
                      key={q.id} 
                      className="question-chip"
                      onClick={() => handleQuestionClick(q)}
                      disabled={isTyping}
                    >
                      {q.question}
                    </button>
                  ))}
                  <button 
                    className="question-chip complaint-btn"
                    onClick={() => setIsComplaintMode(true)}
                    disabled={isTyping}
                  >
                    <BsExclamationTriangleFill size={14} style={{ marginLeft: '6px' }} />
                    تبليغ عن مشكلة
                  </button>
                </div>
              </div>
            )}

            {isComplaintMode && (
              <div className="complaint-notice">
                <p>أنت الآن في وضع &quot;تبليغ عن مشكلة&quot;. يرجى كتابة تفاصيل المشكلة وسنرسلها للإدارة.</p>
                <button className="cancel-complaint" onClick={() => setIsComplaintMode(false)}>إلغاء</button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={isComplaintMode ? "اكتب تفاصيل المشكلة هنا..." : "اكتب رسالتك..."}
            />
            <button onClick={sendMessage} disabled={!input.trim() || isTyping}>
              <BsSendFill />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
