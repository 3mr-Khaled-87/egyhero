'use client'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsList, BsBell, BsPersonCircle, BsBoxArrowRight, BsX } from "react-icons/bs"
import Image from 'next/image';
import logo from "@/imgs/logo.png";
import Link from 'next/link';
import './header.css'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/service/apiConfig';
import ProfileImage from '../profile-image/profile-image';

export default function Header(){
    const router = useRouter();
    const [open , setOpen] = useState(false)    
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ show: boolean, message: string, onConfirm: () => void } | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null)
    
    const notificationRef = useRef<HTMLDivElement>(null);
    const mobileNavRef = useRef<HTMLDivElement>(null);
    const menuBtnRef = useRef<any>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (
                mobileNavRef.current && !mobileNavRef.current.contains(event.target as Node) &&
                menuBtnRef.current && !menuBtnRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("role")
        if (token) {
            setIsLoggedIn(true)
            // Check admin role first from cached value
            if (role === "admin") setIsAdmin(true)

            fetch(`${API_BASE_URL}/profile/`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data && (data.image || data.profile_image)) {
                   setProfileImage(data.image || data.profile_image);
                }
                // Also check from JWT decoded role stored in profile
                if (data && data.role === "admin") {
                    setIsAdmin(true);
                }
            })
            .catch(err => console.log(err));

            // Fetch Notifications
            fetch(`${API_BASE_URL}/notifications/`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => {
                if(!res.ok) throw new Error("Notifications not ok");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setNotifications(data);
                    setUnreadCount(data.filter(n => n.is_read === false).length || data.length);
                }
            })
            .catch(err => console.log("Failed to fetch notifications", err));
        }
    }, [])

    const getActorName = (n: any) => {
        return n.actor || n.actor_name || n.user_name || n.sender_name || n.from_user_name || "شخص ما";
    };

    const getVerbText = (n: any) => {
        const verb = (n.verb || "").toLowerCase();
        if (verb.includes("like")) return "أعجب بمنشورك";
        if (verb.includes("comment")) return "علق على منشورك";
        if (verb.includes("solve") || verb.includes("resolved")) return "قام بحل مشكلتك";
        return "تفاعل معك";
    };

    const markNotificationAsRead = (id: any) => {
        const notif = notifications.find(n => n.id === id);
        if (notif && !notif.is_read) {
            // Update UI immediately
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            // Sync with server
            const token = localStorage.getItem("token");
            if (id && typeof id !== 'number' && isNaN(parseInt(id))) return; // Skip if no real ID
            
            fetch(`${API_BASE_URL}/notifications/${id}/read/`, {
                method: 'PATCH',
                headers: { "Authorization": `Bearer ${token}` }
            }).catch(err => console.log("Read status sync failed", err));
        }
    };

    const markAllAsRead = async () => {
        const oldNotifs = [...notifications];
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE_URL}/notifications/read-all/`, {
                method: 'PATCH',
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) {
                // Fallback: If read-all doesn't exist, try individual (ensures permanence)
                const unread = oldNotifs.filter(n => !n.is_read);
                for (const n of unread) {
                    await fetch(`${API_BASE_URL}/notifications/${n.id}/read/`, {
                        method: 'PATCH',
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                }
            }
        } catch (err) { console.log("Mark all read failed", err); }
    };

    const deleteAllNotifications = () => {
        setConfirmModal({
            show: true,
            message: "هل أنت متأكد من حذف جميع الإشعارات؟ لا يمكن التراجع عن هذه الخطوة.",
            onConfirm: async () => {
                const oldNotifs = [...notifications];
                setNotifications([]);
                setUnreadCount(0);
                const token = localStorage.getItem("token");
                try {
                    const res = await fetch(`${API_BASE_URL}/notifications/delete-all/`, {
                        method: 'DELETE',
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (!res.ok) {
                        // Fallback: Individual delete
                        for (const n of oldNotifs) {
                            await fetch(`${API_BASE_URL}/notifications/${n.id}/`, {
                                method: 'DELETE',
                                headers: { "Authorization": `Bearer ${token}` }
                            });
                        }
                    }
                } catch (err) { console.log("Delete all failed", err); }
                setConfirmModal(null);
                setShowNotifications(false);
            }
        });
    };

    const getProfileImgUrl = (url: string | null) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `https://egyhero.social${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const hundelUserProfile = () => {
        router.push("/profile") 
    }

    return(
        <>
            <header>
                {/* Center: Logo */}
                    <div className="logo-center-side">
                        <Link href="/special-thanks" className="logo-center-side-link">
                            <Image src={logo} alt="Egy Hero Logo" className="logo-img-main"/>
                            <h3 className="logo-text">Egy Hero</h3>
                        </Link>
                    </div>
                <div className="logo">
                    
                    {/* Right: Dropdown Menu Icon */}
                    <div className="menu-trigger" ref={menuBtnRef}>
                        {open ? (
                            <BsX className='res-icon' onClick={()=> setOpen(false)}/>
                        ) : (
                            <BsList className='res-icon' onClick={()=> setOpen(true)}/>
                        )}
                    </div>

                </div>
                    
                <div ref={mobileNavRef} className={`responseve ${open ? "show" : ""}`}>
                    <div className="links">
                        <Link href="/home" className='link'>الرئيسية</Link>
                        <Link href="/leaderBoard" className='link'>لوحة المتصدرين</Link>
                        <Link href="/uploadWorks" className='link'>توثيق الأعمال</Link>
                    </div>
                        
                    <div className="register">
                        {isLoggedIn ? (
                            <div className="desktop-buttons-container">
                                {isAdmin && (
                                    <a href="https://egyhero.social/admin/" className="admin-link" title="لوحة الإدارة">
                                        الإدارة
                                    </a>
                                )}
                                
                                <div className="desktop-notifications-only">
                                    <BsBell 
                                        size={25} 
                                        className="bell-icon" 
                                        title="الإشعارات" 
                                        onClick={() => setShowNotifications(!showNotifications)}
                                    />
                                    {unreadCount > 0 && (
                                        <span className="notification-badge notification-badge-desktop">{unreadCount}</span>
                                    )}
                                    
                                     {/* Notifications Dropdown */}
                                    {showNotifications && (
                                        <div ref={notificationRef} className="desktop-notifications-dropdown">
                                            <h4 className="notifications-dropdown-header notifications-dropdown-header-desktop">الإشعارات</h4>
                                            
                                            <div className="notifications-list notifications-list-desktop">
                                                {notifications.length === 0 ? (
                                                    <div className="empty-notifications empty-notifications-desktop">لا توجد إشعارات جديدة في الوقت الحالي</div>
                                                ) : (
                                                    notifications.map((n, idx) => (
                                                        <div 
                                                            key={n.id || idx} 
                                                            onClick={() => {
                                                                markNotificationAsRead(n.id || idx);
                                                                if (n.post_id || n.post) router.push(`/profile?post=${n.post_id || n.post}`);
                                                                setShowNotifications(false);
                                                            }}
                                                            className={`notification-item notification-item-desktop ${n.is_read ? 'read' : 'unread'}`}
                                                        >
                                                            <div className="notification-content">
                                                                <p className="notification-text notification-text-desktop">
                                                                    <span className="notification-actor">{getActorName(n)} </span>
                                                                    {getVerbText(n)}
                                                                </p>
                                                                {n.created_at && <span className="notification-timestamp">{new Date(n.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="desktop-profile-only">
                                    <div onClick={hundelUserProfile} className="desktop-profile-item">
                                        <ProfileImage 
                                            url={profileImage} 
                                            size={35} 
                                            border="2px solid #28a745"
                                            title="حسابي"
                                        />
                                    </div>
                                    <BsBoxArrowRight 
                                        size={30} 
                                        className="logout-icon" 
                                        title="تسجيل الخروج" 
                                        onClick={() => {
                                            localStorage.removeItem("token");
                                            localStorage.removeItem("role");
                                            setIsLoggedIn(false);
                                            window.location.href = "/";
                                        }} 
                                    />
                                </div>
                            </div>
                        ) : 
                        (
                            <Link href="/register" className="register-link">
                                <ProfileImage 
                                    url={null} 
                                    size={32} 
                                />
                                <span className="register-text">إنشاء حساب</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>
            {/* Custom Confirm Modal */}
            {confirmModal && confirmModal.show && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-box">
                        <h3 className="confirm-modal-title">تأكيد العملية</h3>
                        <p className="confirm-modal-message">{confirmModal.message}</p>
                        <div className="confirm-modal-buttons">
                            <button 
                                onClick={() => setConfirmModal(null)}
                                className="confirm-modal-cancel-btn"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={confirmModal.onConfirm}
                                className="confirm-modal-delete-btn"
                            >
                                تأكيد الحذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}