
import React, { useMemo } from 'react';

const BinaryRainBackground = () => {
  const binaryString = useMemo(() => {
    
    return Array.from({ length: 2000 }, () => Math.round(Math.random())).join(' ');
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 text-primary/10 font-mono text-xs whitespace-pre-wrap break-all"
        style={{
          lineHeight: '1.75rem',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
        }}
      >
        {binaryString}
      </div>
    </div>
  );
};

export default BinaryRainBackground;