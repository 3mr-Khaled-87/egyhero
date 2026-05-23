'use client'
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
import { BsPersonCircle, BsPlayCircle } from "react-icons/bs"
import { AiOutlineLike, AiFillLike , AiOutlineComment } from "react-icons/ai"
import React from 'react';
import './posts.css'
import { addComment } from '@/service/comments';
import { toggleLike } from '@/service/likes';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/service/apiConfig';

interface UsersPost {
    id: number;
    user: string;
    user_image?: string | null;
    description: string;
    image1: string;
    image2?: string | null;
    image3?: string | null;
    video?: string | null;
    points : number;
    likes_count : number;
    status: 'pending' | 'approved' | 'rejected';
    is_liked?: boolean;
    activity_name?: string;
}

// Smart media grid — adapts layout to content
function MediaGrid({ post }: { post: UsersPost }) {
    const formatUrl = (url?: string | null) => {
        if (!url) return "";
        if (url.startsWith('http')) return url;
        // Prepend domain if relative
        return `https://egyhero.social${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const images = [post.image1, post.image2, post.image3].filter(Boolean) as string[];
    const hasVideo = !!post.video;
    const totalMedia = images.length + (hasVideo ? 1 : 0);

    if (totalMedia === 0) return null;

    // 1 image, no video
    if (images.length === 1 && !hasVideo) {
        return (
            <img
                src={formatUrl(images[0])}
                alt="post"
                className="postImage"
                style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover', borderRadius: '12px' }}
            />
        );
    }

    // Determine grid columns
    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gap: '6px',
        borderRadius: '12px',
        overflow: 'hidden',
        maxHeight: '380px',
        gridTemplateColumns: totalMedia === 2 ? '1fr 1fr' :
                             totalMedia === 3 ? '2fr 1fr' :
                             '1fr 1fr',
        gridTemplateRows: totalMedia === 3 ? '1fr 1fr' : '1fr',
    };

    const imgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    };

    return (
        <div style={gridStyle}>
            {images.map((src, i) => (
                <div
                    key={i}
                    style={{
                        gridRow: totalMedia === 3 && i === 0 ? '1 / span 2' : 'auto',
                        overflow: 'hidden',
                        minHeight: '150px',
                    }}
                >
                    <img src={formatUrl(src)} alt={`صورة ${i + 1}`} style={imgStyle} />
                </div>
            ))}
            {hasVideo && (
                <div style={{ overflow: 'hidden', minHeight: '150px' }}>
                    <video
                        src={formatUrl(post.video)!}
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            )}
        </div>
    );
}

function getPosts() {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    return fetch(`${API_BASE_URL}/volunteers`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    }).then(res => res.json())
}

function getComments(postId : number) {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    return fetch(`${API_BASE_URL}/volunteers/${postId}/comments/`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    }).then(res => res.json())
}


export default function Posts() {

    const [comments , setComments] = useState<{[key: number]: string}>({})
 

    const [reaction, setReaction] = useState<{
        [key: number]: {like: boolean}
    }>({})

    const [allPosts, setAllPosts] = useState<UsersPost[]>([])
    const [allComments, setAllComments] = useState<{[key: number] : any[]}>({})
    const [showComments, setShowComments] = useState<{[key: number] : boolean}>({})
    const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null)
    const [postsLoading, setPostsLoading] = useState(true)

    const showNotify = (msg: string, type: 'success'|'error' = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    }

    // --- PERSISTENCE HELPERS ---
    const getLocalLikes = (): number[] => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('user_liked_posts');
        return saved ? JSON.parse(saved) : [];
    };

    const toggleLocalLike = (postId: number, add: boolean) => {
        const likes = getLocalLikes();
        const newLikes = add 
            ? Array.from(new Set([...likes, postId]))
            : likes.filter(id => id !== postId);
        localStorage.setItem('user_liked_posts', JSON.stringify(newLikes));
    };

    useEffect(() => {
        const localLikes = getLocalLikes();
        
        getPosts().then(data => {
            const approvedPosts = Array.isArray(data) 
                ? data.filter((post: UsersPost & { status?: string }) => post.status === 'approved')
                : []
            setAllPosts(approvedPosts)

            const initialReactions: {[key: number]: {like: boolean}} = {};

            approvedPosts.forEach((post: UsersPost & { is_liked?: boolean }) => {
                getComments(post.id).then(comments => {
                    setAllComments(prev => ({
                        ...prev,
                        [post.id]: Array.isArray(comments) ? comments : []
                    }))
                })

                // Merge Server state with Local Cache
                const isLikedLocally = localLikes.includes(post.id);
                const isLikedServer = post.is_liked === true;
                
                initialReactions[post.id] = { like: isLikedLocally || isLikedServer };
            });
            setReaction(initialReactions);
        }).finally(() => setPostsLoading(false))
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (!target.closest('.postsDiv') && !target.closest('.active')) {
                setShowComments({});
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAddComment = async (postId: number) => {
        const token = localStorage.getItem("token");
        if (!token) {
            showNotify("يجب تسجيل الدخول أولاً لتتمكن من إضافة تعليق 🔑", "error");
            return;
        }

        try {
            const commentText = comments[postId] || ""
            if (!commentText.trim()) return;

            await addComment(postId, commentText)
            setComments(prev => ({ ...prev, [postId]: "" }))
            showNotify("تم إضافة التعليق بنجاح ✓")
            
            const updatedComments = await getComments(postId)
            setAllComments(prev => ({
                ...prev,
                [postId]: Array.isArray(updatedComments) ? updatedComments : []
            }))
        } catch (error) {
            console.log((error as Error).message)
            showNotify("فشل في إضافة التعليق", "error")
        }
    }

    return (
        <>
            <div className="main-layout-container">
                {/* Left Sidebar */}
                <aside className="sidebar left-sidebar">
                    <div className="sidebar-content">
                        <h3>🌱 إلهام </h3>
                        <div className="quote-card">
                            <p>"خيرُ الناسِ أنفعُهم للناس"</p>
                        </div>
                        <div className="quote-card">
                            <p>"صنائعُ المعروفِ تقي مصارعَ السوء"</p>
                        </div>
                    </div>
                </aside>

                {/* Middle Content */}
                <div className="posts-column">
                    <div className="allPosts">
                        {postsLoading ? (
                            // Skeleton loading cards
                            [1, 2, 3].map(i => (
                                <div key={i} className="skeleton-card">
                                    <div className="skeleton-header">
                                        <div className="skeleton-avatar"></div>
                                        <div className="skeleton-name"></div>
                                    </div>
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line short"></div>
                                    <div className="skeleton-image"></div>
                                </div>
                            ))
                        ) : allPosts.length === 0 ? (
                            // Empty state
                            <div className="empty-feed">
                                <div className="empty-icon">🌱</div>
                                <h2>أهلاً بك في منصة Egy Hero!</h2>
                                <p>لا يوجد أي منشورات حتى الآن.<br/>كن أول بطل يوثّق عمله ويُلهم الجميع!</p>
                                <a href="/uploadWorks" className="upload-cta">وثّق عملك الآن ✨</a>
                            </div>
                        ) : (
                        Array.isArray(allPosts) && allPosts.map((post: UsersPost, postIdx: number) => (
                            <div key={post.id} className="postsDiv">
                                {/* Flex Header: User (R) | Activity (C) | Points (L) */}
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    marginBottom: '20px',
                                    paddingBottom: '12px',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>
                                    {/* Right: User Avatar and Name */}
                                    <div className="user-info-side" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', border: '1.5px solid #28a745', flexShrink: 0 }}>
                                            {post.user_image ? (
                                                <img 
                                                    src={post.user_image.startsWith('http') ? post.user_image : `https://egyhero.social${post.user_image.startsWith('/') ? '' : '/'}${post.user_image}`} 
                                                    alt={post.user} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                            ) : (
                                                <BsPersonCircle className='personIcon' size={42} color="#28a745" />
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <h5 className='personName' style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {post.user}
                                                {postIdx === 0 && allPosts.length === 1 && (
                                                    <span className="first-user-badge" title="أول بطل على المنصة" style={{ fontSize: '12px', padding: '4px 12px' }}>⭐ أول بطل</span>
                                                )}
                                            </h5>
                                        </div>
                                    </div>

                                    {/* Center: Activity Type Badge */}
                                    <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
                                        {post.activity_name && (
                                            <div className="activity-center-badge" style={{ 
                                                fontSize: '11px', 
                                                color: '#166534', 
                                                fontWeight: '800', 
                                                backgroundColor: '#dcfce7', 
                                                padding: '4px 14px', 
                                                borderRadius: '20px',
                                                border: '1px solid #bdf1d2',
                                                whiteSpace: 'nowrap',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}>
                                                {post.activity_name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Left: Points */}
                                    <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end' }}>
                                        <p className='points' style={{ position: 'static', margin: 0, padding: '5px 15px', fontSize: '13px', borderRadius: '12px' }}>
                                            points <span className='points-count' style={{ fontSize: '18px' }}>{post.points}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="postDetails">
                                    <p className='postDesc'>{post.description}</p>
                                    <MediaGrid post={post} />
                                </div>

                                <div className="active-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', width: '100%', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                        <div
                                            onClick={async () => {
                                                const token = localStorage.getItem("token");
                                                if (!token) {
                                                    showNotify("سجل دخولك لتتمكن من التفاعل مع المنشورات ❤️", "error");
                                                    return;
                                                }

                                                const isLiked = reaction[post.id]?.like;
                                                const newLikeState = !isLiked;
                                                
                                                // Optimistic update
                                                setReaction(prev => ({ ...prev, [post.id]: { like: newLikeState } }));
                                                setAllPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: p.likes_count + (newLikeState ? 1 : -1) } : p));
                                                
                                                // Local persistence sync
                                                toggleLocalLike(post.id, newLikeState);

                                                try {
                                                    const resData = await toggleLike(post.id);
                                                    // Sync with actual server count if available
                                                    if (resData && typeof resData.likes_count === 'number') {
                                                        setAllPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: resData.likes_count } : p));
                                                    }
                                                    showNotify(newLikeState ? "تم الإعجاب بالمنشور ❤️" : "تم إزالة الإعجاب");
                                                } catch (err) {
                                                    // Rollback on error
                                                    setReaction(prev => ({ ...prev, [post.id]: { like: isLiked } }));
                                                    setAllPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1) } : p));
                                                    toggleLocalLike(post.id, isLiked); // Rollback local cache
                                                }
                                            }}
                                            className='like'
                                            style={{ cursor: "pointer", color: reaction[post.id]?.like ? "#28a745" : "#333", display: "flex", flexDirection: "column", alignItems: "center", gap: '2px' }}
                                        >
                                            {reaction[post.id]?.like ? <AiFillLike size={25} color="#28a745" /> : <AiOutlineLike size={25} color="#94a3b8" />}
                                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{reaction[post.id]?.like ? "إلغاء الإعجاب" : "أعجبني"}</span>
                                            <span className='likesCount' style={{ color: '#28a745' }}>{post.likes_count}</span>
                                        </div>

                                        <div 
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: '#28a745' }}
                                            onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                        >
                                            <AiOutlineComment size={25} color="#28a745" />
                                            <span style={{ fontSize: '15px', fontWeight: '700' }}>التعليقات</span>
                                        </div>
                                    </div>

                                    {showComments[post.id] && (
                                        <div className="all-comments" style={{ marginTop: '15px', width: '100%' }}>
                                            <div className="add-comment" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder='أضف تعليق' 
                                                    value={comments[post.id] || ""} 
                                                    onChange={(e) => setComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                    style={{ flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
                                                />
                                                <button onClick={() => handleAddComment(post.id)} style={{ padding: '8px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}>أضف</button>
                                            </div>
                                            <div className="comments-list">
                                                {Array.isArray(allComments[post.id]) && allComments[post.id].map((comment: any, index: number) => (
                                                    <div key={`${comment.id}-${index}`} className="comment" style={{ backgroundColor: 'white', padding: '10px', borderRadius: '15px', border: '1px solid #f0f0f0', direction: 'ltr', textAlign: 'left', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '65px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#28a745', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                                                                {(comment.user_name || comment.user || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span style={{ marginTop: '5px', fontWeight: '800', fontSize: '12px', color: '#28a745' }}>{comment.user_name || comment.user}</span>
                                                        </div>
                                                        <div style={{ backgroundColor: '#f1f3f5', padding: '10px 15px', borderRadius: '0 18px 18px 18px', flex: 1 }}>
                                                            <p style={{ margin: 0, fontSize: '14px', color: '#333', direction: 'rtl', textAlign: 'right' }}>{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <aside className="sidebar right-sidebar">
                    <div className="sidebar-content">
                        <h3>✨ كن بطلاً</h3>
                        <div className="quote-card">
                            <p>"الدالُ على الخيرِ كفاعله"</p>
                        </div>
                        <div className="quote-card">
                            <p>"ارحمُوا مَن في الأرضِ يرحمْكم مَن في السماء"</p>
                        </div>

                    </div>
                </aside>
            </div>

            {notification && (
                <div className="notify-toast">
                    {notification.type === 'success' ? '✓' : '✕'} {notification.msg}
                </div>
            )}

            <style jsx>{`
                .main-layout-container {
                    display: flex;
                    height: 100vh;
                    overflow: hidden;
                    background-color: #f8fafc;
                    padding-top: 80px; /* Base padding for the middle column scroll */
                    direction: rtl;
                }
                .sidebar {
                    width: 25%;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center; /* Center motivational content vertically */
                    gap: 20px;
                    background-color: #fff;
                    border-left: 1px solid #e2e8f0;
                    border-right: 1px solid #e2e8f0;
                    margin-top: -80px; /* Pull it up to sit against the header */
                    padding-top: 100px; /* Adjust internal padding to keep content centered but starting behind header */
                }
                .sidebar-content h3 {
                    color: #28a745;
                    font-size: 20px;
                    font-weight: 800;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .quote-card {
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    padding: 20px;
                    border-radius: 15px;
                    margin-bottom: 15px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    border: 1px solid #b7ebc6;
                }
                .quote-card p {
                    margin: 0;
                    font-size: 16px;
                    font-weight: bold;
                    color: #1b5e20;
                    line-height: 1.6;
                    text-align: center;
                }
                .stats-mini-card {
                    background: #fdf2f2;
                    padding: 15px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    margin-top: 20px;
                    border: 1px solid #fecaca;
                }
                .stats-mini-card span {
                    font-weight: 800;
                    color: #991b1b;
                }
                .posts-column {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 20px;
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE and Edge */
                }
                .posts-column::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }
                .notify-toast {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #28a745;
                    color: white;
                    padding: 12px 25px;
                    border-radius: 50px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    z-index: 9999;
                    font-weight: bold;
                    white-space: nowrap;
                    min-width: max-content;
                    text-align: center;
                }
                @media (max-width: 1000px) {
                    .sidebar { display: none; }
                    .posts-column { width: 100%; }
                }
                @media (max-width: 600px) {
                    .activity-center-badge {
                        display: none !important;
                    }
                    .notify-toast {
                        width: 90%;
                        max-width: 400px;
                        font-size: 14px;
                    }
                }
            `}</style>
        </>
    );
}