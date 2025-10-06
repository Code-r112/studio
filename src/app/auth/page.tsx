
"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, KeySquare, Activity, ShieldCheck } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,36.62,44,30.631,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


const featuresToUnlock = [
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: "AI-Powered Filenaming",
        description: "Let AI suggest secure, descriptive names for your files."
    },
    {
        icon: <KeySquare className="h-8 w-8 text-primary" />,
        title: "Secret Key Vault",
        description: "Securely save and manage your encryption keys in your account."
    },
    {
        icon: <Activity className="h-8 w-8 text-primary" />,
        title: "Activity Logging",
        description: "Keep a private log of your encryption and decryption activities."
    },
    {
        icon: <ShieldCheck className="h-8 w-8 text-primary" />,
        title: "Security Center",
        description: "Get personalized security recommendations from our AI."
    }
]

export default function AuthPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
            <Card className="w-full border-none">
                <CardHeader className="text-center">
                <CardTitle className="text-5xl font-bold">Access All Features</CardTitle>
                <CardDescription className="text-xl pt-2">Sign in to unlock your secure key vault, AI-powered tools, activity history, and more.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-8">
                <Button 
                    onClick={signInWithGoogle} 
                    className="w-full max-w-md h-16 text-xl rounded-full" 
                    disabled={loading}
                    size="lg"
                >
                    <GoogleIcon className="mr-2 h-8 w-8" />
                    Continue with Google
                </Button>
                <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 text-left pt-8">
                     {featuresToUnlock.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-secondary p-3 rounded-full">
                               {feature.icon}
                            </div>
                            <div>
                               <h3 className="text-lg font-semibold">{feature.title}</h3>
                               <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
