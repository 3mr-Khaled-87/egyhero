'use client'
import { BsBell as BsBellIcon, BsHouse, BsTrophy, BsCloudUpload, BsInfoCircle } from "react-icons/bs";
import Image from 'next/image';
import logo from "@/imgs/logo.png";
import Link from 'next/link';
import './header.css'
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/service/apiConfig';
import ProfileImage from '../profile-image/profile-image';

interface NotificationItem {
    target_id: number | undefined;
    object_id?: number | string;
    id: number;
    actor?: string;
    actor_name?: string;
    user_name?: string;
    sender_name?: string;
    from_user_name?: string;
    verb?: string;
    is_read: boolean;
    post_id?: number;
    post?: number;
    created_at?: string;
}

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ show: boolean, message: string, onConfirm: () => void } | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null)

    const notificationRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLDivElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const dropdown = document.getElementById('notif-portal-dropdown');
            if (
                notificationRef.current && !notificationRef.current.contains(target) &&
                dropdown && !dropdown.contains(target)
            ) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchUserData = useCallback(() => {
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("role")
        if (token) {
            setIsLoggedIn(true)
            // Check admin role first from cached value
            if (role === "admin") setIsAdmin(true)

            fetch(`${API_BASE_URL}/profile/`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => {
                    if (res.status === 401 || res.status === 403) {
                        // Token expired - clear auth state
                        localStorage.removeItem("token");
                        localStorage.removeItem("role");
                        setIsLoggedIn(false);
                        setIsAdmin(false);
                        throw new Error("Token expired");
                    }
                    if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    if (data && (data.image || data.profile_image)) {
                        const imgUrl = data.image || data.profile_image;
                        setProfileImage(imgUrl);
                        localStorage.setItem("myProfileImage", imgUrl);
                    }
                    if (data && data.username) {
                        localStorage.setItem("myUsername", data.username);
                    }
                    if (data && data.role === "admin") {
                        setIsAdmin(true);
                    }
                })
                .catch(err => console.log("Profile fetch:", err.message));

            // Fetch Notifications
            fetch(`${API_BASE_URL}/notifications/`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error("Notifications not ok");
                    return res.json();
                })
                .then(rawData => {
                    const data = Array.isArray(rawData) ? rawData : (rawData.results || []);
                    if (Array.isArray(data)) {
                        const localReadIds = JSON.parse(localStorage.getItem("readNotificationIds") || "[]");
                        
                        const mergedData = data.map((n: NotificationItem) => {
                            if (n.id && localReadIds.includes(n.id)) {
                                return { ...n, is_read: true };
                            }
                            return n;
                        });

                        setNotifications(mergedData);
                        setUnreadCount(mergedData.filter((n: NotificationItem) => n.is_read === false).length);
                    }
                })
                .catch(err => console.log("Failed to fetch notifications", err));
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUserData();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchUserData]);

    const getActorName = (n: NotificationItem) => {
        return n.actor || n.actor_name || n.user_name || n.sender_name || n.from_user_name || "شخص ما";
    };

    const getVerbText = (n: NotificationItem) => {
        const verb = (n.verb || "").toLowerCase();
        if (verb.includes("like")) return "أعجب بمنشورك";
        if (verb.includes("comment")) return "علق على منشورك";
        if (verb.includes("solve") || verb.includes("resolved")) return "قام بحل مشكلتك";
        return "تفاعل معك";
    };

    const getVerbIcon = (n: NotificationItem) => {
        const verb = (n.verb || "").toLowerCase();
        if (verb.includes("like")) return "❤️";
        if (verb.includes("comment")) return "💬";
        if (verb.includes("solve") || verb.includes("resolved")) return "✅";
        return "🔔";
    };

    const markNotificationAsRead = (id: number) => {
        const notif = notifications.find(n => n.id === id);
        if (notif && !notif.is_read) {
            // Save to localStorage
            const localReadIds = JSON.parse(localStorage.getItem("readNotificationIds") || "[]");
            if (!localReadIds.includes(id)) {
                localReadIds.push(id);
                localStorage.setItem("readNotificationIds", JSON.stringify(localReadIds));
            }

            // Update UI immediately
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Sync with server
            const token = localStorage.getItem("token");

            fetch(`${API_BASE_URL}/notifications/${id}/read/`, {
                method: 'PATCH',
                headers: { "Authorization": `Bearer ${token}` }
            }).catch(err => console.log("Read status sync failed", err));
        }
    };

    const hundelUserProfile = () => {
        router.push("/profile")
    }

    const sortedNotifications = [...notifications].sort((a, b) => {
        if (a.is_read === b.is_read) return 0;
        return a.is_read ? 1 : -1;
    });

    return (
        <>
            <header className="main-header" dir="rtl">
                {/* 1. RIGHT SIDE: Navigation links */}
                <div className="header-section-right">
                    <nav className="desktop-nav-links">
                        <Link href="/home" className='link'>
                            <BsHouse className="nav-icon" />
                            <span className="nav-text">الرئيسية</span>
                        </Link>
                        <Link href="/leaderBoard" className='link'>
                            <BsTrophy className="nav-icon" />
                            <span className="nav-text">لوحة المتصدرين</span>
                        </Link>
                        <Link href="/uploadWorks" className='link'>
                            <BsCloudUpload className="nav-icon" />
                            <span className="nav-text">توثيق الأعمال</span>
                        </Link>
                        <Link href="/about" className='link'>
                            <BsInfoCircle className="nav-icon" />
                            <span className="nav-text">من نحن</span>
                        </Link>
                    </nav>
                </div>

                {/* 2. CENTER: Logo */}
                <div className="header-section-center">
                    <Link href="/special-thanks" className="logo-link">
                        <Image src={logo} alt="Egy Hero Logo" className="logo-img-main" priority />
                        {/* <h3 className="logo-text">Egy Hero</h3> */}
                    </Link>
                </div>

                {/* 3. LEFT SIDE: Register / User Actions */}
                <div className="header-section-left">
                    {isLoggedIn ? (
                        <div className="user-actions-container">
                            {isAdmin && (
                                <a href="https://egyhero.social/admin/" className="admin-link" title="لوحة الإدارة">
                                    الإدارة
                                </a>
                            )}

                            {/* Notifications Wrapper */}
                            <div className="notifications-wrapper" ref={notificationRef}>
                                <div
                                    className="bell-trigger"
                                    ref={bellRef}
                                    onClick={() => {
                                        if (!showNotifications && bellRef.current) {
                                            const rect = bellRef.current.getBoundingClientRect();
                                            setDropdownPos({
                                                top: rect.bottom + 8,
                                                left: rect.left,
                                            });
                                        }
                                        setShowNotifications(prev => !prev);
                                    }}
                                >
                                    <BsBellIcon size={24} className="bell-icon" title="الإشعارات" />
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">{unreadCount}</span>
                                    )}
                                </div>
                            </div>

                            {/* Profile image trigger */}
                            <div onClick={hundelUserProfile} className="profile-item-wrapper" title="حسابي">
                                <ProfileImage
                                    url={profileImage}
                                    size={35}
                                    border="2px solid #28a745"
                                />
                            </div>
                        </div>
                    ) : (
                        <Link href="/register" className="register-link" title="إنشاء حساب">
                            <ProfileImage url={null} size={32} />
                            <span className="register-text">إنشاء حساب</span>
                        </Link>
                    )}
                </div>

            </header>

            {/* ===== Notification Dropdown PORTAL — rendered outside header DOM ===== */}
            {showNotifications && typeof document !== 'undefined' && createPortal(
                <div
                    id="notif-portal-dropdown"
                    className="notifications-dropdown"
                    style={{
                        position: 'fixed',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        zIndex: 99999,
                    }}
                >
                    <h4 className="notifications-dropdown-header">الإشعارات</h4>
                    <div className="notifications-list">
                        {sortedNotifications.length === 0 ? (
                            <div className="empty-notifications">لا توجد إشعارات في الوقت الحالي</div>
                        ) : (
                            sortedNotifications.map((n, idx) => (
                                <div
                                    key={n.id || idx}
                                    onClick={() => {
                                        if (n.id) markNotificationAsRead(n.id);
                                        const postRef = n.post_id || n.post || n.target_id || n.object_id;
                                        if (postRef) {
                                            router.push(`/home?post=${postRef}`);
                                        } else {
                                            router.push('/home');
                                        }
                                        setShowNotifications(false);
                                    }}
                                    className={`notification-item ${n.is_read ? 'read' : 'unread'}`}
                                >
                                    <div className="notification-icon-circle">
                                        {getVerbIcon(n)}
                                    </div>
                                    <div className="notification-content">
                                        <p className="notification-text">
                                            <span className="notification-actor">{getActorName(n)} </span>
                                            {getVerbText(n)}
                                        </p>
                                        {n.created_at && (
                                            <span className="notification-timestamp">
                                                {new Date(n.created_at).toLocaleDateString('ar-EG', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        )}
                                    </div>
                                    {!n.is_read && <div className="notification-unread-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>,
                document.body
            )}

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