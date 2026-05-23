'use client'

import { FiArrowLeft, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import { BsPersonFill } from "react-icons/bs"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/service/auth"
import Image from "next/image"
import authBg from "@/imgs/auth-bg.png"
import logo from "@/imgs/logo.png"
import styles from "./register.module.css"

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "", // Added confirm_password
        username: "",
    })
    const [showPassword, setShowPassword] = useState(false) // Added showPassword state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("") // Added error state

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validation for matching passwords
        if (form.password !== form.confirm_password) {
            setError("كلمات المرور غير متطابقة")
            return
        }

        setLoading(true)
        setError("")
        try {
            await registerUser(form)
            router.push("/login")
        } catch (error: any) {
            console.error(error)
            if (error.response?.data?.email) {
                setError("هذا البريد الإلكتروني مسجل بالفعل")
            } else if (error.response?.data?.username) {
                setError("اسم المستخدم هذا مأخوذ بالفعل")
            } else {
                setError("حدث خطأ أثناء الإنشاء. يرجى التأكد من أن البريد الإلكتروني أو اسم المستخدم غير مكرر، وأن كلمة المرور قوية.")
            }
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
                            <h2>إنشاء حساب جديد</h2>
                            <p>انضم إلينا وكن بطلًا في سباق الخير</p>
                        </div>

                        {error && (
                            <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>
                                {error}
                            </div>
                        )}

                        <form className={styles.authForm} onSubmit={handleSubmit}>
                            <div className={styles.nameRow}>
                                <div className={styles.inputGroup}>
                                    <FiUser className={styles.icon} />
                                    <input 
                                        type="text" 
                                        placeholder="الاسم الأول" 
                                        required 
                                        onChange={(e) => setForm({...form, first_name: e.target.value})} 
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <FiUser className={styles.icon} />
                                    <input 
                                        type="text" 
                                        placeholder="الاسم الأخير" 
                                        required 
                                        onChange={(e) => setForm({...form, last_name: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <FiUser className={styles.icon} />
                                <input 
                                    type="text" 
                                    placeholder="اسم المستخدم" 
                                    required 
                                    onChange={(e) => setForm({...form, username: e.target.value})} 
                                />
                            </div>

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

                            <div className={styles.inputGroup}>
                                <FiLock className={styles.icon} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="تأكيد كلمة المرور" 
                                    required 
                                    onChange={(e) => setForm({...form, confirm_password: e.target.value})} 
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
                                {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                            </button>

                            <div className={styles.authFooter}>
                                <span>لديك حساب بالفعل؟ </span>
                                <Link href="/login" className={styles.toggleLink}>تسجيل الدخول</Link>
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
                        <h1 className={`${styles.mainTitle} ${styles.logoGradient}`}>إبدأ رحلتك الآن</h1>
                        <p className={`${styles.subTitle} ${styles.logoGradient}`}>انضم لآلاف المتطوعين وكن جزءاً من التغيير الإيجابي</p>
                    </div>
                </div>
            </div>
        </div>
    )
}