'use client'

import { FiArrowLeft, FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi"
import { useState } from "react"
import Link from "next/link"
import { userLogin } from "@/service/auth"
import Image from "next/image"
import authBg from "@/imgs/auth-bg.png"
import logo from "@/imgs/logo.png"
import styles from "./login.module.css"

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false) // Added showPassword state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        
        try {
            const data = await userLogin(form)
            const token = data.token || data.access || data.key
            if (token) {
                localStorage.setItem("token", token)
                // Store role for protected route checks
                const userRole = data.role || "user"
                localStorage.setItem("role", userRole)
                localStorage.setItem("hasSeenWelcome", "true")
                
                // Redirect admin to external admin dashboard, others to home
                if (userRole === "admin") {
                    window.location.href = "https://egyhero.social/admin/"
                } else {
                    window.location.href = "/home"
                }
            }
        } catch (err) {
            console.error(err)
            setError("خطأ في البريد الإلكتروني أو كلمة المرور. يرجى التأكد من صحة البيانات.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.authWrapper}>
            <div className={styles.bgImage}>
                <Image src={authBg} alt="Background" fill style={{ objectFit: 'cover', filter: 'brightness(0.7)' }} priority />
            </div>

            <div className={styles.overlay} />

            <Link href="/" className={styles.backLink}>
                <FiArrowLeft size={24} />
            </Link>

            <div className={styles.authContent} dir="rtl">
                <div className={styles.formContainer}>
                    
                    <div className={`${styles.authCard} ${styles.glass}`}>
                        <div className={styles.cardHeader}>
                            <h2>تسجيل الدخول</h2>
                            <p>مرحباً بك مجدداً في مجتمع أبطال مصر</p>
                        </div>

                        {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>{error}</div>}

                        <form className={styles.authForm} onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <FiMail className={styles.icon} />
                                <input 
                                    type="email" 
                                    placeholder="البريد الإلكتروني" 
                                    required 
                                    onChange={(e) => setForm({...form, email: e.target.value})} 
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <FiLock className={styles.icon} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="كلمة المرور" 
                                    required 
                                    onChange={(e) => setForm({...form, password: e.target.value})} 
                                />
                                <button 
                                    type="button" 
                                    className={styles.eyeIcon} 
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                <FiLogIn style={{ marginLeft: '10px' }} />
                                {loading ? "جاري التحقق..." : "تسجيل الدخول"}
                            </button>




                            <div className={styles.authFooter}>
                                <span>ليس لديك حساب؟ </span>
                                <Link href="/register" className={styles.toggleLink}>إنشاء حساب جديد</Link>

                            </div>
                        </form>
                    </div>
                </div>

                <div className={styles.heroBranding}>
                    <div className={styles.brandingContent}>
                        <div className={styles.heroFigure}>
                            <Image 
                                src={logo} 
                                alt="Egy Hero Logo" 
                                width={180} 
                                height={180} 
                                className={styles.logoImage}
                                priority
                            />
                        </div>
                        <h1 className={`${styles.mainTitle} ${styles.logoGradient}`}>أهلاً بك يا بطل</h1>
                        <p className={`${styles.subTitle} ${styles.logoGradient}`}>سجل دخولك لتستمر في رحلة العطاء والتميز</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
