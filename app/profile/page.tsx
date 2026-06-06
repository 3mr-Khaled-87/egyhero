'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Header from "@/components/header/header";
import { BsGearFill, BsTrophyFill, BsTelephoneFill, BsEnvelopeFill, BsGeoAltFill, BsBoxArrowRight, BsTrashFill } from "react-icons/bs";
import { useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/service/apiConfig';
import ChatBot from "@/components/chatbot/chatbot";
import ProfileImage from '@/components/profile-image/profile-image';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  total_likes: number;
  phone: string | null;
  address: string | null;
  points: number;
  rank: string;
  profile_image: string | null;
  image?: string | null;
  first_name?: string;
  last_name?: string;
}

interface UserPost {
  id: number;
  user: string; // The backend usually returns the username string
  user_image?: string | null; // Assuming backend might provide this
  activity_name: string;
  description: string;
  image1: string | null;
  status: string;
  likes_count: number;
  points: number;
  created_at: string;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6' }}>
        <h2 style={{ color: '#28a745' }}>جاري التحميل...</h2>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', address: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, message: string, onConfirm: () => void } | null>(null);
  
  const searchParams = useSearchParams();
  const targetPostId = searchParams.get('post');

  const showNotify = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleDeletePost = async (postId: number) => {
    setConfirmModal({
        show: true,
        message: "هل أنت متأكد من مسح هذا العمل؟ لا يمكن التراجع عن هذه الخطوة.",
        onConfirm: async () => {
            const token = localStorage.getItem("token");
            try {
              const res = await fetch(`${API_BASE_URL}/volunteers/${postId}/`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
              });
              if (res.ok || res.status === 204) {
                setPosts(prev => prev.filter(p => p.id !== postId));
                showNotify("تم مسح العمل بنجاح", "success");
              } else {
                throw new Error("Failed to delete");
              }
            } catch {
              showNotify("حدث خطأ أثناء مسح العمل", "error");
            }
            setConfirmModal(null);
        }
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      // Fetch Profile
      const profRes = await fetch(`${API_BASE_URL}/profile/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        setEditForm({ phone: profData.phone || '', address: profData.address || '' });
      }

      // Fetch Portfolio
      const portRes = await fetch(`${API_BASE_URL}/my-portfolio/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (portRes.ok) {
        const portData = await portRes.json();
        setPosts(Array.isArray(portData) ? portData : (portData.results || []));
      }
    } catch (err) {
      console.log(err);
      showNotify("حدث خطأ في جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading && targetPostId && posts.length > 0) {
      const postId = parseInt(targetPostId);
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex !== -1) {
        if (postIndex >= 2) {
          setShowAllPosts(true);
        }
        
        setTimeout(() => {
          const element = document.getElementById(`post-${postId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.style.boxShadow = "0 0 20px rgba(40, 167, 69, 0.5)";
            element.style.border = "2px solid #28a745";
          }
        }, 500);
      }
    }
  }, [loading, targetPostId, posts]);

  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    const formData = new FormData();
    
    // Append fields
    if (editForm.phone) formData.append("phone", editForm.phone);
    if (editForm.address) formData.append("address", editForm.address);
    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/profile/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const updatedProf = await res.json();
        setProfile(updatedProf);
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
        showNotify("تم حفظ البيانات بنجاح", "success");
        // Reload to ensure global state (Header) is updated with new image
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Save error detail:", errorData);
        let errorMsg = "فشل في حفظ البيانات";
        if (errorData.image) errorMsg = "خطأ في الصورة (ربما الحجم كبير)";
        if (errorData.detail) errorMsg = errorData.detail;
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      showNotify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const displayedPosts = showAllPosts ? posts : posts.slice(0, 2);

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

  return (
    <>
      <Header />
      <ChatBot />
      <div className="profile-container" dir="rtl">
        <div className="profile-wrapper">
          
          {/* Profile Card */}
          <div className="profile-card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="profile-cover"></div>
            
            <div className="profile-header-content">
              <div className="avatar-wrapper">
                <ProfileImage 
                  url={profile?.image || profile?.profile_image} 
                  size={120} 
                  border="4px solid white"
                />
              </div>

              <div className="profile-actions">
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <BsGearFill /> تعديل البيانات
                </button>
                <button className="logout-btn" onClick={() => {
                   localStorage.removeItem("token");
                   localStorage.removeItem("role");
                   window.location.href = "/";
                }}>
                  <BsBoxArrowRight /> تسجيل الخروج
                </button>
              </div>
            </div>

            <div className="profile-info-section">
              <h1 className="username">
                {(() => {
                  const fName = profile?.first_name || (profile as any)?.user?.first_name;
                  const lName = profile?.last_name || (profile as any)?.user?.last_name;
                  return (fName && lName) ? `${fName} ${lName}` : (profile?.username || (profile as any)?.user?.username || "مستخدم");
                })()}
              </h1>
              <div className="rank-badge">
                <BsTrophyFill color="#f59e0b" />
                <span>{profile?.rank || "متطوع"}</span>
              </div>
            </div>

            <div className="profile-body">
              <div className="stats-row">
                <div className="stat-box">
                  <span className="stat-value">{profile?.points || 0}</span>
                  <span className="stat-label">النقاط</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{profile?.total_likes || 0}</span>
                  <span className="stat-label">الإعجابات</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{posts.length}</span>
                  <span className="stat-label">الأعمال</span>
                </div>
              </div>

              <div className="contact-info">
                <div className="info-item">
                  <BsEnvelopeFill className="info-icon" />
                  <span>{profile?.email || "غير متوفر"}</span>
                </div>
                <div className="info-item">
                  <BsTelephoneFill className="info-icon" />
                  <span>{profile?.phone || "لم يتم إضافة رقم هاتف"}</span>
                </div>
                <div className="info-item">
                  <BsGeoAltFill className="info-icon" />
                  <span>{profile?.address || "لم يتم إضافة عنوان"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="posts-section glass-panel">
            <h2 className="section-title">أعمالي وإنجازاتي</h2>
            
            {posts.length === 0 ? (
              <div className="no-posts">
                <p>لم تقم برفع أي أعمال بعد.</p>
              </div>
            ) : (
              <div className="posts-grid">
                {displayedPosts.map(post => (
                  <div key={post.id} id={`post-${post.id}`} className="post-card">
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 20,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                      }}
                      title="مسح العمل"
                    >
                      <BsTrashFill />
                    </button>
                    <div className="post-status" data-status={post.status}>
                      {post.status === 'approved' ? 'مقبول' : post.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                    </div>
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

            {posts.length > 2 && (
              <button className="show-all-btn" onClick={() => setShowAllPosts(!showAllPosts)}>
                {showAllPosts ? "عرض أقل" : "عرض الكل"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>تعديل البيانات الشخصية</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #28a745' }} />
                ) : (
                    <ProfileImage 
                      url={profile?.image || profile?.profile_image} 
                      size={80} 
                      border="none" 
                    />
                )}
            </div>

            <div className="form-group">
              <label>رقم الهاتف</label>
              <input 
                type="text" 
                value={editForm.phone} 
                onChange={e => setEditForm({...editForm, phone: e.target.value})}
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div className="form-group">
              <label>العنوان</label>
              <input 
                type="text" 
                value={editForm.address} 
                onChange={e => setEditForm({...editForm, address: e.target.value})}
                placeholder="المحافظة، المدينة..."
              />
            </div>
            <div className="form-group">
              <label>صورة الملف الشخصي</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                style={{
                    padding: '10px',
                    border: '2px dashed #28a745',
                    width: '100%',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>يفضل استخدام صورة مربعة بحجم أقل من 2MB</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => { setIsEditing(false); setImagePreview(null); }} disabled={saving}>إلغاء</button>
              <button className="save-btn" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`toast ${notification.type}`}>
          {notification.msg}
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal && confirmModal.show && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', maxWidth: '400px', width: '90%', textAlign: 'center', backgroundColor: 'white' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>تأكيد العملية</h3>
                  <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '25px' }}>{confirmModal.message}</p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button 
                          onClick={() => setConfirmModal(null)}
                          className="cancel-btn"
                          style={{ padding: '10px 25px', borderRadius: '10px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                          إلغاء
                      </button>
                      <button 
                          onClick={confirmModal.onConfirm}
                          className="save-btn"
                          style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                          تأكيد الحذف
                      </button>
                  </div>
              </div>
          </div>
      )}

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
        .profile-cover {
          height: 180px;
          background: linear-gradient(135deg, #22c55e, #fbbf24);
          width: 100%;
        }
        .profile-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0 40px;
          margin-top: -60px; /* pull avatar up into cover */
        }
        .avatar-wrapper {
          border-radius: 50%;
          background: white;
          padding: 6px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .profile-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .profile-info-section {
          padding: 20px 40px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 25px;
        }
        .username {
          margin: 0;
          color: #1b5e20;
          font-weight: 900;
          font-size: 32px;
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
        .edit-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
        }
        .edit-btn:hover {
          background: #218838;
          transform: translateY(-2px);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fee2e2;
          color: #ef4444;
          border: 1px solid #fca5a5;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
        }
        .logout-btn:hover {
          background: #fecaca;
          color: #dc2626;
          transform: translateY(-2px);
        }
        .profile-body {
          padding: 0 40px 40px;
        }
        .stats-row {
          display: flex;
          justify-content: space-around;
          margin-bottom: 30px;
          gap: 15px;
          flex-wrap: wrap;
        }
        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f8f9fa;
          padding: 15px 20px;
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          flex: 1 1 25%;
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
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #495057;
          font-size: 16px;
        }
        .info-icon {
          color: #28a745;
          font-size: 20px;
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
        .post-status {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 5px 12px;
          border-radius: 20px;
          color: white;
          font-weight: bold;
          font-size: 12px;
          z-index: 10;
        }
        .post-status[data-status="approved"] { background: #28a745; }
        .post-status[data-status="pending"] { background: #f59e0b; }
        .post-status[data-status="rejected"] { background: #dc3545; }
        
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
        .show-all-btn {
          width: 100%;
          padding: 15px;
          background: white;
          border: 2px solid #28a745;
          color: #28a745;
          font-weight: bold;
          font-size: 16px;
          border-radius: 12px;
          margin-top: 20px;
          cursor: pointer;
          transition: 0.3s;
        }
        .show-all-btn:hover {
          background: #28a745;
          color: white;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          width: 100%;
          max-width: 400px;
          background: white;
          padding: 30px;
          border-radius: 20px;
        }
        .modal-content h2 {
          color: #1b5e20;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #495057;
          font-weight: bold;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-family: inherit;
          outline: none;
        }
        .form-group input:focus {
          border-color: #28a745;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 30px;
        }
        .cancel-btn, .save-btn {
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          border: none;
        }
        .cancel-btn {
          background: #e2e8f0;
          color: #475569;
        }
        .save-btn {
          background: #28a745;
          color: white;
        }
        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 25px;
          border-radius: 50px;
          color: white;
          font-weight: bold;
          z-index: 9999;
          animation: slideUp 0.3s ease-out;
        }
        .toast.success { background: #28a745; }
        .toast.error { background: #dc3545; }
        @keyframes slideUp {
          from { bottom: 0; opacity: 0; }
          to { bottom: 30px; opacity: 1; }
        }
        @media (max-width: 600px) {
          .profile-header-content {
            flex-direction: column;
            align-items: center;
            padding: 0 20px;
          }
          .profile-actions {
            flex-direction: column;
            width: 100%;
            margin-top: 15px;
          }
          .profile-actions button {
            width: 100%;
            justify-content: center;
          }
          .profile-info-section {
            align-items: center;
            text-align: center;
            padding: 20px;
          }
          .profile-body {
            padding: 0 20px 20px;
          }
          .stat-box {
            padding: 15px 10px;
          }
        }
      `}</style>
    </>
  );
}
