import Header from "../../components/header/header"
import Posts from '../../components/posts/posts'  
import ChatBot from "@/components/chatbot/chatbot";
import DailyToast from "@/components/daily-toast/daily-toast";
import VideoFooter from "@/components/video-footer/video-footer";
import "./home.css";

export default function Home() {
  return (
    <>
      <Header/>
      <ChatBot />
      <DailyToast />
      <div className="home-container">
        <main className="home-main">
          <Posts/>
        </main>
        <aside className="home-sidebar">
        </aside>
      </div>
      <VideoFooter />
    </>
  );
}
