import React from 'react';
import { BsPersonCircle } from "react-icons/bs";

interface ProfileImageProps {
  url?: string | null;
  size?: number;
  className?: string;
  border?: string;
  title?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ 
  url, 
  size = 35, 
  className = "", 
  border = "1px solid #28a745",
  title = ""
}) => {
  if (!url) {
    return <BsPersonCircle size={size} color="#28a745" className={className} title={title} />;
  }

  // Handle URL normalization
  const finalUrl = url.startsWith('http') 
    ? url 
    : `https://egyhero.social${url.startsWith('/') ? '' : '/'}${url}`;

  return (
    <img 
      src={finalUrl} 
      alt="Profile" 
      title={title}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        borderRadius: '50%', 
        objectFit: 'cover', 
        border: border 
      }} 
      className={className}
    />
  );
};

export default ProfileImage;
