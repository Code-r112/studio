import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import Loading from './loading';
import { Providers } from './providers';
import { Template } from '@/components/layout/template';
import CustomCursor from '@/components/ui/custom-cursor';

export const metadata: Metadata = {
  title: 'CipherLock',
  description: 'Securely encrypt and decrypt your files with AES.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-1.34 0C6.5 20.5 3 18 3 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6-3 1.5 1.8 4 3 6 3a1 1 0 0 1 1 1z'/><path d='m9 12 2 2 4-4'/></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <Providers>
          <CustomCursor />
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<Loading />}>
                <Template key={Math.random()}>
                  {children}
                </Template>
              </Suspense>
            </main>
            <Footer />
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}
