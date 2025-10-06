
"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import Loading from '@/app/loading';
import { AnimatePresence, motion } from 'framer-motion';

export function PageTransitionProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleStart = () => {
            timeout = setTimeout(() => {
                setIsTransitioning(true);
            }, 200); // 200ms delay before showing loader
        };

        const handleComplete = () => {
            clearTimeout(timeout);
            setIsTransitioning(false);
        };
        
        handleStart();
        handleComplete(); // Initially call to set state correctly on load

        return () => {
            clearTimeout(timeout);
        };

    }, [pathname]);

    useEffect(() => {
      // This effect handles the completion of the page load.
      // We assume loading is done when the component mounts/updates.
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Adjust this delay to match your page load times
      return () => clearTimeout(timer);
    }, [pathname]);


    return (
        <>
            <AnimatePresence mode="wait">
                {isTransitioning && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Loading />
                    </motion.div>
                )}
            </AnimatePresence>
            {!isTransitioning && children}
        </>
    );
}
