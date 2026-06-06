'use client';

import Image from 'next/image';
import Header from '@/components/header/header';
import Hlogo from '@/imgs/Hlogo.png';
import './about.css';
import { BsPersonFill } from "react-icons/bs";

const supervisor = {
    name: 'د. أحمد محمود صالح',
    role: 'المشرف العام على المشروع',
    emoji: '🎓',
};

const frontEnd = [
    { name: 'عمرو خالد' },
    { name: 'آية الله خالد' },
    { name: 'إسراء جميل' },
    { name: 'جهاد عيد' },
];

const uiTeam = [
    { name: 'آية رمضان' },
    { name: 'سهيلة فتحي' },
    { name: 'سهيلة شعبان' },
];

const backEnd = [
    { name: 'علاء منصور' },
    { name: 'نورهان بدر الدين' },
    { name: 'يوسف ربيع' },
];

const social = [
    { name: 'أمنية وائل' },
    { name: 'أسماء محمد' },
];

function MemberCard({ name, delay = 0 }: { name: string; delay?: number }) {
    return (
        <div className="member-card" style={{ animationDelay: `${delay * 0.1}s` }}>
            <div className="member-avatar">
                <BsPersonFill size={20} color="white" />
            </div>
            <p className="member-name">{name}</p>
        </div>
    );
}

function TeamSection({
    title,
    icon,
    members,
    color,
    startDelay,
}: {
    title: string;
    icon: string;
    members: { name: string }[];
    color: string;
    startDelay: number;
}) {
    return (
        <div className="team-section">
            <div className="team-section-header" style={{ borderColor: color }}>
                <span className="team-icon">{icon}</span>
                <h3 className="team-title" style={{ color }}>{title}</h3>
            </div>
            <div className="members-grid">
                {members.map((m, i) => (
                    <MemberCard key={m.name} name={m.name} delay={startDelay + i} />
                ))}
            </div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="about-page" dir="rtl">
                {/* Hero Section */}
                <section className="about-hero">
                    <div className="hero-orb hero-orb-1" />
                    <div className="hero-orb hero-orb-2" />
                    <div className="hero-badge">
                        <span>🌟 فريق Egy Hero</span>
                    </div>
                    <h1 className="hero-title">
                        من <span className="gradient-text">نحن</span>؟
                    </h1>
                    <p className="hero-subtitle">
                        نحن مجموعة من الشباب المصري المؤمن بقوة التطوع وأثره في المجتمع،
                        اجتمعنا لبناء منصة تُلهم وتُحفّز أبطال التطوع على مشاركة قصصهم مع العالم.
                    </p>

                </section>

                {/* Supervisor Card */}
                <section className="supervisor-section">
                    <div className="supervisor-card">
                        <div className="supervisor-glow" />
                        <div className="supervisor-badge">المشرف العام</div>
                        <div className="supervisor-avatar">
                            <span className="supervisor-emoji">{supervisor.emoji}</span>
                        </div>
                        <h2 className="supervisor-name">{supervisor.name}</h2>
                        <p className="supervisor-role">{supervisor.role}</p>

                    </div>
                </section>

                {/* Divider */}
                <div className="section-divider">
                    <div className="divider-line" />
                    <span className="divider-text">⚡ فريق العمل</span>
                    <div className="divider-line" />
                </div>

                {/* Teams */}
                <section className="teams-container">
                    <TeamSection
                        title="تيم الفرونت إند"
                        icon="💻"
                        members={frontEnd}
                        color="#16a34a"
                        startDelay={0}
                    />
                    <TeamSection
                        title="تيم الـ UI / UX"
                        icon="🎨"
                        members={uiTeam}
                        color="#eab308"
                        startDelay={4}
                    />
                    <TeamSection
                        title="تيم الباك إند"
                        icon="⚙️"
                        members={backEnd}
                        color="#16a34a"
                        startDelay={7}
                    />
                    <TeamSection
                        title="تيم السوشيال ميديا"
                        icon="📣"
                        members={social}
                        color="#eab308"
                        startDelay={10}
                    />
                </section>

                {/* Footer Quote & Footer */}
                <footer className="about-footer-quote">
                    <div className="quote-content">
                        <blockquote>
                            &quot;خيرُ الناسِ أنفعُهم للناس&quot;
                        </blockquote>
                        <p>معًا نصنع فارقاً ❤️</p>
                    </div>

                    <div className="small-footer-bottom">
                        <div className="cooperation-section">
                            <span>بالتعاون مع مؤسسة حياة كريمة</span>
                            <Image src={Hlogo} alt="Hayah Karema logo" className="hk-logo" />
                        </div>
                        <p>© {new Date().getFullYear()} Egy Hero. جميع الحقوق محفوظة.</p>
                    </div>
                </footer>
            </main>
        </>
    );
}
