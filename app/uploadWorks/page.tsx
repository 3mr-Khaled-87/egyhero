'use client'

import React, { useState, useRef } from 'react';
import Header from "@/components/header/header";
import { BsCloudUploadFill, BsCardImage, BsCameraVideo, BsSendFill } from "react-icons/bs";
import { API_BASE_URL } from '@/service/apiConfig';
import ChatBot from "@/components/chatbot/chatbot";

export default function UploadWorksPage() {
    const [activityName, setActivityName] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

    const imageRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLInputElement>(null);

    const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activityName || !description) {
            showNotify("يرجى تعبئة الحقول الإلزامية", "error");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            showNotify("يرجى تسجيل الدخول أولاً", "error");
            setTimeout(() => { window.location.href = "/login"; }, 2000);
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("activity_name", activityName);
        formData.append("description", description);
        if (imageFile) formData.append("image1", imageFile);
        if (videoFile) formData.append("video", videoFile);

        try {
            const res = await fetch(`${API_BASE_URL}/volunteers/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                showNotify("تم رفع عملك بنجاح! سيتم مراجعته لإضافته لرصيدك", "success");
                
                // Clear form
                setActivityName("");
                setDescription("");
                setImageFile(null);
                setVideoFile(null);
                
                setTimeout(() => {
                    window.location.href = "/profile";
                }, 2000);
            } else {
                throw new Error("فشل الرفع");
            }
        } catch (error) {
            showNotify("حدث خطأ أثناء الرفع، تأكد من الاتصال وجرب مرة أخرى", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <ChatBot />
            <div className="upload-container" dir="rtl">
                <div className="upload-wrapper glass-panel">
                    <div className="header-section">
                        <BsCloudUploadFill size={50} color="#28a745" style={{ marginBottom: '15px' }} />
                        <h1 className="title">توثيق أعمالك التطوعية</h1>
                        <p className="subtitle">شارك إنجازاتك مع مجتمع إيجي هيرو لتحصل على النقاط والتقدير</p>
                    </div>

                    <form onSubmit={handleUpload} className="upload-form">
                        
                        <div className="form-group">
                            <label className="input-label">نوع النشاط التطوعي <span className="required">*</span></label>
                            <select 
                                value={activityName} 
                                onChange={(e) => setActivityName(e.target.value)}
                                className="styled-input"
                            >
                                <option value="" disabled>اختر نوع النشاط...</option>
                                <option value="إجتماعي">نشاط إجتماعي</option>
                                <option value="بيئي">نشاط بيئي</option>
                                <option value="طبي">نشاط طبي</option>
                                <option value="تعليمي">نشاط تعليمي</option>
                                <option value="أخرى">أخرى</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="input-label">وصف الإنجاز <span className="required">*</span></label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                className="styled-input textarea"
                                placeholder="صف ما قمت به بالتفصيل وكيف أثر ذلك بالمجتمع..."
                                rows={4}
                            />
                        </div>

                        <div className="media-upload-section">
                            <div 
                                className="media-box" 
                                onClick={() => imageRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    ref={imageRef} 
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                                    hidden 
                                />
                                <BsCardImage size={40} color={imageFile ? "#28a745" : "#6c757d"} />
                                <span className={imageFile ? "success-text" : "normal-text"}>
                                    {imageFile ? imageFile.name : "إرفاق صورة العمل"}
                                </span>
                            </div>

                            <div 
                                className="media-box" 
                                onClick={() => videoRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    accept="video/*" 
                                    ref={videoRef} 
                                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)} 
                                    hidden 
                                />
                                <BsCameraVideo size={40} color={videoFile ? "#28a745" : "#6c757d"} />
                                <span className={videoFile ? "success-text" : "normal-text"}>
                                    {videoFile ? videoFile.name : "إرفاق فيديو (اختياري)"}
                                </span>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "جاري الرفع..." : <><BsSendFill /> توثيق الإنجاز</>}
                        </button>
                    </form>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={`toast ${notification.type}`}>
                    {notification.msg}
                </div>
            )}

            <style>{`
                .upload-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    padding: 120px 20px 40px;
                    font-family: 'Tajawal', sans-serif;
                }
                .upload-wrapper {
                    max-width: 700px;
                    margin: 0 auto;
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 24px;
                    box-shadow: 0 10px 40px rgba(34, 197, 94, 0.1);
                    padding: 40px;
                }
                .header-section {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px dashed #e2e8f0;
                }
                .title {
                    color: #1b5e20;
                    font-size: 32px;
                    font-weight: 900;
                    margin: 0 0 10px 0;
                }
                .subtitle {
                    color: #64748b;
                    font-size: 16px;
                    margin: 0;
                }
                .upload-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .input-label {
                    color: #1e293b;
                    font-weight: bold;
                    font-size: 16px;
                }
                .required {
                    color: #dc3545;
                }
                .styled-input {
                    padding: 15px;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    font-size: 16px;
                    font-family: inherit;
                    color: #334155;
                    transition: all 0.3s ease;
                    outline: none;
                    background: #f8fafc;
                }
                .styled-input:focus {
                    border-color: #28a745;
                    box-shadow: 0 0 0 4px rgba(40, 167, 69, 0.1);
                    background: white;
                }
                .textarea {
                    resize: vertical;
                    min-height: 120px;
                }
                .media-upload-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-top: 10px;
                }
                .media-box {
                    border: 2px dashed #cbd5e1;
                    padding: 30px 20px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: #f8fafc;
                    text-align: center;
                }
                .media-box:hover {
                    border-color: #28a745;
                    background: #f0fdf4;
                    transform: translateY(-2px);
                }
                .normal-text {
                    color: #64748b;
                    font-weight: bold;
                    font-size: 14px;
                }
                .success-text {
                    color: #28a745;
                    font-weight: bold;
                    font-size: 14px;
                    word-break: break-all;
                }
                .submit-btn {
                    margin-top: 20px;
                    background: #28a745;
                    color: white;
                    padding: 18px;
                    border-radius: 16px;
                    border: none;
                    font-size: 18px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
                }
                .submit-btn:hover:not(:disabled) {
                    background: #218838;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
                }
                .submit-btn:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .toast {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 15px 30px;
                    border-radius: 50px;
                    color: white;
                    font-weight: bold;
                    z-index: 9999;
                    animation: slideUp 0.3s ease-out;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .toast.success { background: linear-gradient(135deg, #16a34a, #22c55e); }
                .toast.error { background: linear-gradient(135deg, #dc2626, #ef4444); }

                @keyframes slideUp {
                    from { bottom: -50px; opacity: 0; }
                    to { bottom: 30px; opacity: 1; }
                }

                @media (max-width: 600px) {
                    .media-upload-section {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}
