'use client';

import { BsPlayFill } from 'react-icons/bs';
import Link from 'next/link';
import './video-footer.css';

interface VideoFooterProps {
  mobileOnly?: boolean;
}

export default function VideoFooter({ mobileOnly = false }: VideoFooterProps) {
  return (
    <div className={`video-footer${mobileOnly ? ' video-footer-mobile-only' : ''}`} dir="rtl">
      <Link 
        href="/?preview=true"
        className="video-float-btn"
        title="تعرف على الموقع"
      >
        <BsPlayFill size={26} />
      </Link>
    </div>
  );
}
