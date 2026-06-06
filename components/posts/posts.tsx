'use client'
import { BsPersonCircle, BsPlayCircle } from "react-icons/bs"
import { AiOutlineLike, AiFillLike, AiOutlineComment } from "react-icons/ai"
import Link from 'next/link';
import React from 'react';
import './posts.css'
import Image from 'next/image';
import { addComment } from '@/service/comments';
import { toggleLike } from '@/service/likes';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/service/apiConfig';
import { useRouter, useSearchParams } from 'next/navigation';

interface UsersPost {
    id: number;
    user: string;
    user_image?: string | null;
    description: string;
    image1: string;
    image2?: string | null;
    image3?: string | null;
    video?: string | null;
    points: number;
    likes_count: number;
    status: 'pending' | 'approved' | 'rejected';
    is_liked?: boolean;
    activity_name?: string;
}

interface CommentItem {
    id: number;
    user?: string;
    user_name?: string;
    content: string;
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
            <Image
                src={formatUrl(images[0])}
                alt="post"
                style={{ width: '100%', height: 'auto', maxHeight: '230px', objectFit: 'cover', borderRadius: '12px' }}
                width={500}
                height={300}
                priority
            />
        );
    }

    // Determine grid columns
    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gap: '6px',
        borderRadius: '12px',
        overflow: 'hidden',
        maxHeight: '210px',
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
                    <Image src={formatUrl(src)} alt={`صورة ${i + 1}`} style={imgStyle} width={500} height={300} />
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
    return fetch(`${API_BASE_URL}/volunteers/`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    }).then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
    }).catch(err => {
        console.error("Failed to fetch posts:", err);
        return [];
    });
}

function getComments(postId: number) {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    return fetch(`${API_BASE_URL}/volunteers/${postId}/comments/`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    }).then(res => {
        if (!res.ok) throw new Error(`Comments error: ${res.status}`);
        return res.json();
    }).then(rawData => {
        return Array.isArray(rawData) ? rawData : (rawData.results || []);
    }).catch(err => {
        console.error(`Failed to fetch comments for post ${postId}:`, err);
        return [];
    });
}


export default function Posts() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetPostId = searchParams.get('post');

    const [comments, setComments] = useState<{ [key: number]: string }>({})
    const [reaction, setReaction] = useState<{
        [key: number]: { like: boolean }
    }>({})
    const [allPosts, setAllPosts] = useState<UsersPost[]>([])
    const [allComments, setAllComments] = useState<{ [key: number]: CommentItem[] }>({})
    const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({})
    const [myUsername, setMyUsername] = useState<string | null>(null);
    const [myProfileImage, setMyProfileImage] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null)
    const [postsLoading, setPostsLoading] = useState(true)

    const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
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
        const fetchData = async () => {
            const localLikes = getLocalLikes();
            const rawData = await getPosts();
            const data = Array.isArray(rawData) ? rawData : (rawData.results || []);
            const approvedPosts = data.filter((post: UsersPost & { status?: string }) => post.status === 'approved');
            setAllPosts(approvedPosts);

            const initialReactions: { [key: number]: { like: boolean } } = {};
            for (const post of approvedPosts) {
                const comments = await getComments(post.id);
                setAllComments(prev => ({
                    ...prev,
                    [post.id]: Array.isArray(comments) ? comments : []
                }));
                const isLikedLocally = localLikes.includes(post.id);
                const isLikedServer = post.is_liked === true;
                initialReactions[post.id] = { like: isLikedLocally || isLikedServer };
            }
            setReaction(initialReactions);
            setPostsLoading(false);
            const username = typeof window !== 'undefined' ? localStorage.getItem('myUsername') : null;
            const profileImg = typeof window !== 'undefined' ? localStorage.getItem('myProfileImage') : null;
            setMyUsername(username);
            setMyProfileImage(profileImg);
        };
        fetchData();
    }, []);

    // Highlight and scroll to target post from notifications
    useEffect(() => {
        if (!postsLoading && targetPostId && allPosts.length > 0) {
            const postId = parseInt(targetPostId);
            setTimeout(() => {
                const element = document.getElementById(`post-${postId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.transition = "all 0.5s ease";
                    element.style.boxShadow = "0 0 20px rgba(40, 167, 69, 0.4)";
                    element.style.border = "2px solid #28a745";
                    // Automatically open comments
                    setShowComments(prev => ({ ...prev, [postId]: true }));

                    // Remove highlight after a few seconds
                    setTimeout(() => {
                        element.style.boxShadow = "";
                        element.style.border = "";
                    }, 3000);
                }
            }, 500);
        }
    }, [postsLoading, targetPostId, allPosts]);

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

    // State to track expanded/collapsed description per post
    const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});
    return (
        <>
            <div className="main-layout-container">
                {/* Left Sidebar */}
                <aside className="sidebar left-sidebar">
                    <div className="sidebar-content">
                        <h3>🌱 إلهام اليوم</h3>
                        <div className="quote-card">
                            <p>{"\u0022"}خيرُ الناسِ أنفعُهم للناس{"\u0022"}</p>
                        </div>
                        <div className="quote-card">
                            <p>{"\u0022"}صنائعُ المعروفِ تقي مصارعَ السوء{"\u0022"}</p>
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
                                <p>لا يوجد أي منشورات حتى الآن.<br />كن أول بطل يوثّق عمله ويُلهم الجميع!</p>
                                <a href="/uploadWorks" className="upload-cta">وثّق عملك الآن ✨</a>
                            </div>
                        ) : (
                            Array.isArray(allPosts) && allPosts.map((post: UsersPost, postIdx: number) => (
                                <div key={post.id} id={`post-${post.id}`} className="postsDiv">
                                    {/* Flex Header: User (R) | Activity (C) | Points (L) */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                        paddingBottom: '8px',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        {/* Right: User Avatar and Name */}
                                        <div
                                            className="user-info-side"
                                            style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', cursor: 'pointer' }}
                                            onClick={() => router.push(`/public-profile?user=${encodeURIComponent(post.user)}`)}
                                        >
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

                                    <div className="postDetails" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                        <p className='postDesc'>
                                            {post.description.length > 150 && !expandedPosts[post.id]
                                                ? post.description.slice(0, 150) + "..."
                                                : post.description}
                                            {post.description.length > 150 && (
                                                <button
                                                    onClick={() => setExpandedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                                    style={{ color: '#28a745', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginRight: '5px' }}
                                                >
                                                    {expandedPosts[post.id] ? " عرض أقل" : " عرض المزيد"}
                                                </button>
                                            )}
                                        </p>
                                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                                            <MediaGrid post={post} />
                                        </div>
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
                                                    } catch {
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
                                                    {Array.isArray(allComments[post.id]) && allComments[post.id].map((comment: CommentItem, index: number) => (
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
                            <p>{"\u0022"}الدالُ على الخيرِ كفاعله{"\u0022"}</p>
                        </div>
                        <div className="quote-card">
                            <p>{"\u0022"}ارحمُوا مَن في الأرضِ يرحمْكم مَن في السماء{"\u0022"}</p>
                        </div>

                        <div className="hel-taelam-card">
                            <p className="hel-taelam-title">هل تعلم؟ 💡</p>
                            <p className="hel-taelam-text">المتطوعون يعيشون حياة أطول وأكثر سعادة!</p>
                        </div>

                        <Link href="/?preview=true" className="sidebar-video-wrapper">
                            <div className="sidebar-video-circle">
                                <BsPlayCircle size={36} />
                            </div>
                            <span className="sidebar-video-label">تعرف على الموقع</span>
                        </Link>

                    </div>
                </aside>
            </div>

            {notification && (
                <div className="notify-toast">
                    {notification.type === 'success' ? '✓' : '✕'} {notification.msg}
                </div>
            )}

        </>
    );
}