import React from 'react';
import Image from 'next/image';

interface FixedImagePlaceholderProps {
  name: string;
  background?: string;
  color?: string;
  size?: number;
  fontSize?: number;
  bold?: boolean;
  length?: number;
}

const FixedImagePlaceholder: React.FC<FixedImagePlaceholderProps> = ({
  name,
  background = '7b3526',
  color = 'fff',
  size = 300,
  fontSize = 0.33,
  bold = true,
  length = 20
}) => {
  // Create the URL for ui-avatars.com
  const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=${color}&size=${size}&font-size=${fontSize}&bold=${bold ? 'true' : 'false'}&length=${length}`;

  return (
    <Image
      src={imageUrl}
      alt={name}
      width={size}
      height={size}
      unoptimized
      className="object-cover"
    />
  );
};

export default FixedImagePlaceholder;
