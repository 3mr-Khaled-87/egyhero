'use client';

import { BsPlayCircle } from 'react-icons/bs';
import Link from 'next/link';
import './video-footer.css';

export default function VideoFooter() {
  return (
    <div className="video-footer" dir="rtl">
      <Link 
        href="/?preview=true"
        className="video-button"
        title="تعرف على الموقع"
      >
        <div className="circle-icon">
          <BsPlayCircle size={40} />
        </div>
        <span className="circle-label">تعرف على الموقع</span>
      </Link>
    </div>
  );
}
