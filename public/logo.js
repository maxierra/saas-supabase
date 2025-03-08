import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <div className="relative h-full w-full">
      <Image
        src="/logo.jpg"
        alt="Logo"
        width={400}
        height={400}
        className="object-contain"
        priority
      />
    </div>
  );
};

export default Logo;