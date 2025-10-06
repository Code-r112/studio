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
