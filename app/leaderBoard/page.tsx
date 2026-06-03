"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/header/header";
import "./leaderBoard.css";
import { 
  BsPersonCircle, 
  BsStarFill, 
  BsChevronLeft
} from "react-icons/bs";

import { API_BASE_URL } from "@/service/apiConfig";
import ChatBot from "@/components/chatbot/chatbot";

interface User {
  id: number;
  username: string;
  total_points: number;
}

interface VolunteerPost {
  user: string;
  status: 'pending' | 'approved' | 'rejected';
  points?: number;
}

export default function PerfectLeaderboard() {
  const [list, setList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("week");
  const [loading, setLoading] = useState(true);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [myProfileImage, setMyProfileImage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/volunteers/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error("فشل الاتصال بالسيرفر");
      const rawPosts = await res.json();
      const posts = Array.isArray(rawPosts) ? rawPosts : (rawPosts.results || []);
      
      if (Array.isArray(posts) && posts.length > 0) {
        // Calculate points dynamically from approved posts only
        const pointsMap = new Map<string, number>();
        posts.forEach((post: VolunteerPost) => {
            if (post.status === 'approved') {
                pointsMap.set(post.user, (pointsMap.get(post.user) || 0) + (post.points || 0));
            }
        });

        const calculatedList: User[] = Array.from(pointsMap.entries())
            .map(([username, total_points], index) => ({
                id: index,
                username,
                total_points
            }))
            .filter(u => u.total_points > 0)
            .sort((a, b) => b.total_points - a.total_points);

        setList(calculatedList);
      } else {
        setList([]);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMyUsername(localStorage.getItem("myUsername"));
    setMyProfileImage(localStorage.getItem("myProfileImage"));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const effectiveUsername = myUsername || "";
  const myRankIndex = effectiveUsername ? list.findIndex(u => u.username === effectiveUsername) : -1;
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : 0;
  const nextRankPoints = myRank > 1 ? list[myRank - 2].total_points - list[myRank - 1].total_points : 0;

  return (
    <div className="leaderboard-page" dir="rtl">
      <Header />
      <ChatBot />
      <main className="main-content">
        <div className="content-wrapper glass-panel">

          {/* Rank Alert */}
          <div className="user-alert">
            {myRank > 0 ? (
              <div className="alert-flex">
                <span>أنت في المركز <strong>{myRank}</strong> 🔥</span>
                {myRank > 1 && (
                  <span className="diff-text">متبقي لك <strong>{nextRankPoints}</strong> نقطة للوصول للمركز {myRank - 1}</span>
                )}
              </div>
            ) : (
              "سجل نقاطاً بتوثيق أعمالك لتظهر في لوحة المتصدرين وتنافس الأبطال!"
            )}
          </div>
          
          {/* Tabs */}
          <div className="tabs-container">
            <div className="pill-group">
               <button 
                 onClick={() => setActiveTab("today")} 
                 className={`tab-btn ${activeTab === "today" ? "selected" : ""}`}
               >
                 اليوم
               </button>
               <button 
                 onClick={() => setActiveTab("week")} 
                 className={`tab-btn ${activeTab === "week" ? "selected" : ""}`}
               >
                 الأسبوع
               </button>
            </div>
          </div>

          {/* List Content */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>جاري تحميل قائمة الأبطال... ⏳</p>
            </div>
          ) : (
            <div className="board-list">
              {list.length > 0 ? (
                list.map((user, idx) => {
                  const isMe = user.username === effectiveUsername;
                  const rank = idx + 1;
                  return (
                    <div key={`${user.username}-${idx}`} className={`rank-card ${isMe ? "is-me" : ""} ${rank <= 3 ? `top-${rank}` : ""}`}>
                      <div className="rank-main">
                        <div className="rank-visual">
                          <span className="rank-num">#{rank}</span>
                          {rank <= 3 && (
                            <span className="medal-win">
                              {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                            </span>
                          )}
                        </div>
                        
                        <div className="user-profile">
                          <div className="avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isMe && myProfileImage ? (
                                <img 
                                    src={myProfileImage.startsWith('http') ? myProfileImage : `https://egyhero.social${myProfileImage.startsWith('/') ? '' : '/'}${myProfileImage}`} 
                                    alt="My Profile" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            ) : (
                                <BsPersonCircle style={{ width: '100%', height: '100%', color: '#28a745' }} />
                            )}
                          </div>
                          <div className="info">
                            <span className="user-name">{isMe ? "أنا (أنت)" : user.username}</span>
                            <span className="user-badge">{rank <= 3 ? "بطل متميز" : "متطوع نشط"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="score-section">
                        <div className="points-pill">
                          <BsStarFill className="star-icon" />
                          <span className="points-val">{user.total_points}</span>
                          <span className="points-label">نقطة</span>
                        </div>
                        {isMe && <BsChevronLeft className="me-indicator" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">لا يوجد بيانات حالياً</div>
              )}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}