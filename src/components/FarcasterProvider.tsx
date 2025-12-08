'use client';

import { useEffect, useState, ReactNode } from 'react';
import sdk from '@farcaster/frame-sdk';

interface FarcasterProviderProps {
  children: ReactNode;
}

export default function FarcasterProvider({ children }: FarcasterProviderProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Initialize Farcaster SDK context
        const context = await sdk.context;
        
        // Signal to Farcaster that the app is ready
        await sdk.actions.ready();
        
        console.log('Farcaster SDK initialized', context);
        setIsSDKLoaded(true);
      } catch (error) {
        // Not running in Farcaster context, continue normally
        console.log('Not in Farcaster context or SDK init failed:', error);
        setIsSDKLoaded(true);
      }
    };

    initFarcaster();
  }, []);

  return <>{children}</>;
}
