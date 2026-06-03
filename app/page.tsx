'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BsPlayFill, BsStarFill, BsCardChecklist, BsPersonPlusFill } from 'react-icons/bs';
import { API_BASE_URL } from '@/service/apiConfig';
import landingBg from '@/imgs/landing-bg.png';
import logo from '@/imgs/logo.png';
import Hlogo from '@/imgs/Hlogo.png';
import ChatBot from "@/components/chatbot/chatbot";
import VideoFooter from "@/components/video-footer/video-footer";
import "./mainPage.css"

interface VolunteerPost {
  user: string;
  status: 'pending' | 'approved' | 'rejected';
  points?: number;
}

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState({
    heroes: 0,
    works: 0,
    points: 0
  });

  useEffect(() => {
    // ── Pre-mount Check ──────────────────────────────────────────
    const searchParams = new URLSearchParams(window.location.search);
    const isPreview = searchParams.get('preview') === 'true';

    const hasSeenWelcome = typeof window !== 'undefined' && localStorage.getItem('hasSeenWelcome');

    // Show landing page on first visit ALWAYS (regardless of login state)

    // Only redirect to home if they've been here before
    if (!isPreview && hasSeenWelcome) {
      router.replace('/home');
      return;
    }
    setLoading(false);
    // Check login state
    setIsLoggedIn(!!localStorage.getItem('token'));

    // ── Fetch Global Stats ───────────────────────────────────────
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/volunteers/`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const rawData = await res.json();
        const data = Array.isArray(rawData) ? rawData : (rawData.results || []);

        const uniqueUsers = new Set(data.map((p: VolunteerPost) => p.user)).size;
        const approvedWorks = data.filter((p: VolunteerPost) => p.status === 'approved').length;
        const totalPoints = data.reduce((acc: number, p: VolunteerPost) => acc + (p.points || 0), 0);

        setStats({
          heroes: uniqueUsers,
          works: approvedWorks,
          points: totalPoints
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [router]);

  const markSeenAndNavigate = (targetPath: string) => {
    localStorage.setItem('hasSeenWelcome', 'true');
    router.push(targetPath);
  };

  if (loading) return null; // Avoid flicker

  return (
    <div className="landing-wrapper" dir="rtl">
      <ChatBot />
      {/* Top Section - Hero */}
      <section className="hero-landing">
        <span className='overlay'></span>
        <div className="bg-overlay">
          <Image
            src={landingBg}
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <div className="hero-inner">
          <div className="header-branding">
            <div className="branding-row">
              {/* Right Side: Logo and Slogan */}
              <div className="branding-right">
                <div className="logo-container">
                  <Image src={logo} alt="Egy Hero" width={120} height={100} className="logo-main" />
                </div>
                <h1 className="brand-txt">EGY HERO</h1>
                <h2 className="main-slogan">بطل في سباق الخير</h2>
              </div>

              {/* Left Side: Description */}
              <div className="description-left">
                <p className="description-txt">
                  منصة رقمية تهدف إلى تحفيز الشباب على المشاركة في العمل التطوعي وتوثيق إنجازاتهم المجتمعية بأسلوب تفاعلي ومحفز.
                </p>
              </div>
            </div>

            <div className="cta-container">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => markSeenAndNavigate('/home')}
                    className="yellow-pill-btn"
                  >
                    🏠 استكشف الأعمال
                  </button>
                  <button
                    onClick={() => markSeenAndNavigate('/uploadWorks')}
                    className="secondary-pill-btn"
                  >
                    ✨ وثّق عملك الآن
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => markSeenAndNavigate('/register')}
                    className="yellow-pill-btn"
                  >
                    إبدأ رحلتك
                  </button>
                  <button
                    onClick={() => markSeenAndNavigate('/home')}
                    className="secondary-pill-btn"
                  >
                    تصفح كضيف
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="landing-main">
        {/* Video Placeholder */}
        <div className="video-box-container">
          <div className="dashed-video-box">
            <div className="play-icon-circle">
              <BsPlayFill size={50} color="#1b5e20" />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row-container">
          {/* بطل مشارك */}
          <div className="stat-card-gold">
            <div className="stat-icon-gold">
              <BsPersonPlusFill size={55} />
            </div>
            <div className="stat-content">
              <h3>+{stats.heroes.toLocaleString('ar-EG')}</h3>
              <p>بطل مشارك</p>
            </div>
          </div>

          {/* عمل تطوعي */}
          <div className="stat-card-gold">
            <div className="stat-icon-gold">
              <BsCardChecklist size={55} />
            </div>
            <div className="stat-content">
              <h3>+{stats.works.toLocaleString('ar-EG')}</h3>
              <p>عمل تطوعي موثق</p>
            </div>
          </div>

          {/* نقطة خير */}
          <div className="stat-card-gold">
            <div className="stat-icon-gold">
              <BsStarFill size={55} />
            </div>
            <div className="stat-content">
              <h3>+{stats.points.toLocaleString('ar-EG')}</h3>
              <p>نقطة خير تم جمعها</p>
            </div>
          </div>
        </div>
      </main>

      {/* Small Footer */}
      <footer className="landing-small-footer">
          <div className="cooperation-section">
              <div className="coop-text">
                  <span>نفتخر بأن هذه المنصة تم إطلاقها بالتعاون المثمر مع </span>
                  <span className="highlight-text">مؤسسة حياة كريمة </span>
                  <span>لتعزيز روح التطوع وخدمة المجتمع.</span>
              </div>
              <Image src={Hlogo} alt="Hayah Karema logo" className="hk-logo" />
          </div>
          <p>© {new Date().getFullYear()} Egy Hero. جميع الحقوق محفوظة.</p>
      </footer>

      <VideoFooter />
    </div>
  );
}