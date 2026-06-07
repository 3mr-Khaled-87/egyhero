'use client';

import Image from 'next/image';
import Header from '@/components/header/header';
import Hlogo from '@/imgs/Hlogo.png';
import './about.css';

const supervisor = {
    name: 'د. أحمد محمود صالح',
    role: 'المشرف العام على المشروع',
    photo: '/team/dr_ahmed.jfif',
};

const frontEnd = [
    { name: 'عمرو خالد',      role: 'Frontend Developer', photo: '/team/amr_khaled.jfif' },
    { name: 'آية الله خالد', role: 'Frontend Developer', photo: '/team/ayat_allah_khaled.jfif' },
    { name: 'إسراء جميل',    role: 'Frontend Developer', photo: '/team/israa_jameel.jfif' },
    { name: 'جهاد عيد',      role: 'Frontend Developer', photo: '/team/gehad_eid.png' },
];

const uiTeam = [
    { name: 'آية رمضان',   role: 'UI / UX Designer', photo: '/team/aya_ramadan.jfif' },
    { name: 'سهيلة فتحي',  role: 'UI / UX Designer', photo: '/team/suhaila_fathi.jfif' },
    { name: 'سهيلة شعبان', role: 'UI / UX Designer', photo: '/team/suhaila_shaaban.jfif' },
];

const backEnd = [
    { name: 'علاء منصور',       role: 'Backend Developer', photo: '/team/alaa_mansour.jfif' },
    { name: 'نورهان بدر الدين', role: 'Backend Developer', photo: '/team/nourhan_badr.jfif' },
    { name: 'يوسف ربيع',        role: 'Backend Developer', photo: '/team/yousef_rabie.jfif' },
];

const social = [
    { name: 'أمنية وائل',  role: 'Social Media Manager', photo: '/team/omneya_wael.jfif' },
    { name: 'أسماء قناوي', role: 'Social Media Manager', photo: '/team/asmaa_qanawi.jfif' },
];

const teams = [
    { title: 'الفرونت إند', icon: '💻', members: frontEnd, accent: '#16a34a', tag: 'Frontend' },
    { title: 'UI / UX',     icon: '🎨', members: uiTeam,   accent: '#d97706', tag: 'Design' },
    { title: 'الباك إند',   icon: '⚙️', members: backEnd,  accent: '#0ea5e9', tag: 'Backend' },
    { title: 'السوشيال ميديا', icon: '📣', members: social, accent: '#9333ea', tag: 'Media' },
];

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="about-page" dir="rtl">

                {/* ── HERO ── */}
                <section className="hero">
                    <div className="hero-blob b1" />
                    <div className="hero-blob b2" />
                    <div className="hero-blob b3" />
                    <div className="hero-inner">
                        <span className="hero-chip">🌟 فريق Egy Hero</span>
                        <h1 className="hero-heading">
                            من <em>نحن</em>؟
                        </h1>
                        <p className="hero-sub">
                            شباب مصري مؤمن بالتطوع، اجتمعنا لبناء منصة تُلهم الأبطال وتُحفّزهم على مشاركة قصصهم مع العالم.
                        </p>
                    </div>
                </section>

                {/* ── SUPERVISOR ── */}
                <section className="sup-section">
                    <div className="sup-card">
                        <div className="sup-ribbon">المشرف العام</div>
                        <div className="sup-photo-wrap">
                            <div className="sup-ring" />
                            <Image
                                src={supervisor.photo}
                                alt={supervisor.name}
                                width={140}
                                height={140}
                                className="sup-photo"
                                unoptimized
                            />
                        </div>
                        <h2 className="sup-name">{supervisor.name}</h2>
                        <p className="sup-role">{supervisor.role}</p>
                    </div>
                </section>

                {/* ── DIVIDER ── */}
                <div className="wave-divider" aria-hidden="true">
                    <span>⚡ فريق العمل</span>
                </div>

                {/* ── TEAMS ── */}
                <section className="teams-wrapper">
                    {teams.map((team) => (
                        <div key={team.title} className="team-block">
                            {/* Team header */}
                            <div className="team-head" style={{ '--accent': team.accent } as React.CSSProperties}>
                                <span className="team-icon-badge">{team.icon}</span>
                                <div>
                                    <p className="team-tag">{team.tag}</p>
                                    <h3 className="team-name">{team.title}</h3>
                                </div>
                            </div>

                            {/* Members grid */}
                            <div className="members-grid">
                                {team.members.map((m, i) => (
                                    <div
                                        key={m.name}
                                        className="member-card"
                                        style={{
                                            animationDelay: `${i * 0.08}s`,
                                            '--accent': team.accent,
                                        } as React.CSSProperties}
                                    >
                                        <div className="member-photo-wrap">
                                            <div className="member-ring" />
                                            <Image
                                                src={m.photo}
                                                alt={m.name}
                                                width={80}
                                                height={80}
                                                className="member-photo"
                                                unoptimized
                                            />
                                        </div>
                                        <p className="member-name">{m.name}</p>
                                        <p className="member-role">{m.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                {/* ── FOOTER QUOTE ── */}
                <footer className="about-footer" dir="rtl">
                    <div className="footer-glow" />
                    <blockquote>&quot;خيرُ الناسِ أنفعُهم للناس&quot;</blockquote>
                    <p className="footer-sub">معًا نصنع فارقاً ❤️</p>
                    <div className="footer-bottom">
                        <div className="collab-pill">
                            <span>بالتعاون مع مؤسسة حياة كريمة</span>
                            <Image src={Hlogo} alt="Hayah Karema" className="hk-logo" />
                        </div>
                        <p className="copy">© {new Date().getFullYear()} Egy Hero. جميع الحقوق محفوظة.</p>
                    </div>
                </footer>
            </main>
        </>
    );
}
