'use client'
import Header from "../../components/header/header"
import Posts from '../../components/posts/posts'  
import ChatBot from "@/components/chatbot/chatbot";
import DailyToast from "@/components/daily-toast/daily-toast";
import VideoFooter from "@/components/video-footer/video-footer";
import "./home.css";
import { Suspense } from 'react';

export default function Home() {
  return (
    <>
      <Header/>
      <ChatBot />
      <DailyToast />
      <div className="home-container">
        <main className="home-main">
          <Suspense fallback={<div className="loading">جارٍ التحميل...</div>}>
            <Posts/>
          </Suspense>
        </main>
        <aside className="home-sidebar">
        </aside>
      </div>
      <VideoFooter mobileOnly />
    </>
  );
}
