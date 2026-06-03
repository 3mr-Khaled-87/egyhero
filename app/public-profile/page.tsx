'use client'

import React, { useState, useEffect, Suspense } from 'react';
import Header from "@/components/header/header";
import { BsTrophyFill, BsPersonCircle } from "react-icons/bs";
import { useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/service/apiConfig';
import ChatBot from "@/components/chatbot/chatbot";
import ProfileImage from '@/components/profile-image/profile-image';

interface UserPost {
  id: number;
  user: string;
  user_image?: string | null;
  activity_name: string;
  description: string;
  image1: string | null;
  status: string;
  likes_count: number;
  points: number;
  created_at: string;
}

export default function PublicProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6' }}>
        <h2 style={{ color: '#28a745' }}>جاري التحميل...</h2>
      </div>
    }>
      <PublicProfileContent />
    </Suspense>
  );
}

function PublicProfileContent() {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [userImage, setUserImage] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const targetUser = searchParams.get('user');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/volunteers/`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });

        if (res.ok) {
          const rawPosts = await res.json();
          const allPosts = Array.isArray(rawPosts) ? rawPosts : (rawPosts.results || []);
          if (Array.isArray(allPosts)) {
            const userPosts = allPosts.filter(p => p.user === targetUser);
            
            // Only show approved posts publicly
            const approvedPosts = userPosts.filter(p => p.status === 'approved');
            setPosts(approvedPosts);

            let points = 0;
            let likes = 0;
            let img = null;
            approvedPosts.forEach(post => {
              points += post.points || 0;
              likes += post.likes_count || 0;
              if (post.user_image) img = post.user_image;
            });

            setTotalPoints(points);
            setTotalLikes(likes);
            setUserImage(img);
          }
        }
      } catch (err) {
        console.error("Error fetching user data", err);
      } finally {
        setLoading(false);
      }
    };

    if (targetUser) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [targetUser]);

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6' }}>
          <h2 style={{ color: '#28a745' }}>جاري التحميل...</h2>
        </div>
      </>
    );
  }

  if (!targetUser) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6' }}>
          <h2 style={{ color: '#dc3545' }}>لم يتم العثور على المستخدم</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <ChatBot />
      <div className="profile-container" dir="rtl">
        <div className="profile-wrapper">
          
          {/* Profile Card */}
          <div className="profile-card glass-panel">
            <div className="profile-header">
              <div className="avatar-section">
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #28a745', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                  {userImage ? (
                    <img 
                      src={userImage.startsWith('http') ? userImage : `https://egyhero.social${userImage.startsWith('/') ? '' : '/'}${userImage}`} 
                      alt={targetUser} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <BsPersonCircle size={80} color="#28a745" />
                  )}
                </div>
                <h1 className="username">{targetUser}</h1>
                <div className="rank-badge">
                  <BsTrophyFill color="#f59e0b" />
                  <span>متطوع</span>
                </div>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <span className="stat-value">{totalPoints}</span>
                <span className="stat-label">النقاط</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{totalLikes}</span>
                <span className="stat-label">الإعجابات</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{posts.length}</span>
                <span className="stat-label">الأعمال</span>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="posts-section glass-panel">
            <h2 className="section-title">أعمال وإنجازات {targetUser}</h2>
            
            {posts.length === 0 ? (
              <div className="no-posts">
                <p>لا توجد أعمال معتمدة لهذا المستخدم حتى الآن.</p>
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map(post => (
                  <div key={post.id} className="post-card">
                    {post.image1 ? (
                      <div className="post-image-wrapper">
                        <img 
                          src={post.image1.startsWith('http') ? post.image1 : `https://egyhero.social${post.image1.startsWith('/') ? '' : '/'}${post.image1}`} 
                          alt="Work" 
                          className="post-image" 
                        />
                      </div>
                    ) : (
                      <div className="post-image-placeholder">لا توجد صورة</div>
                    )}
                    <div className="post-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <ProfileImage 
                          url={userImage} 
                          size={35} 
                        />
                        <h3 className="post-activity" style={{ margin: 0 }}>{post.activity_name}</h3>
                      </div>
                      <p className="post-desc">{post.description}</p>
                      <div className="post-meta">
                        <span className="meta-item">❤️ {post.likes_count || 0}</span>
                        <span className="meta-item">⭐ {post.points || 0} نقطة</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .profile-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
          padding: 120px 20px 40px;
          font-family: 'Tajawal', sans-serif;
        }
        .profile-wrapper {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(34, 197, 94, 0.1);
          padding: 30px;
        }
        .profile-header {
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .username {
          margin: 0;
          color: #1b5e20;
          font-weight: 800;
          font-size: 28px;
        }
        .rank-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef3c7;
          color: #d97706;
          padding: 6px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
        }
        .stats-row {
          display: flex;
          justify-content: space-around;
        }
        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f8f9fa;
          padding: 15px 30px;
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .stat-value {
          font-size: 24px;
          font-weight: 900;
          color: #28a745;
        }
        .stat-label {
          color: #6c757d;
          font-size: 14px;
          font-weight: bold;
        }
        .section-title {
          color: #1b5e20;
          font-weight: 800;
          border-bottom: 2px solid #28a745;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .post-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          position: relative;
          transition: 0.3s;
        }
        .post-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .post-image-wrapper {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }
        .post-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .post-image-placeholder {
          width: 100%;
          height: 200px;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #adb5bd;
        }
        .post-content {
          padding: 20px;
        }
        .post-activity {
          color: #1b5e20;
          margin: 0 0 10px 0;
          font-size: 18px;
          font-weight: bold;
        }
        .post-desc {
          color: #6c757d;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 15px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .post-meta {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #f0f0f0;
          padding-top: 10px;
        }
        .meta-item {
          font-weight: bold;
          color: #495057;
        }
        .no-posts {
          text-align: center;
          color: #6c757d;
          padding: 40px;
          font-size: 18px;
        }
      `}</style>
    </>
  );
}
