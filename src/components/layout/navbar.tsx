
"use client";

import { ShieldCheck, User as UserIcon, LogOut, History, KeyRound, ShieldAlert, Menu } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '../ui/separator';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const [isSheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const MobileMenu = () => (
     <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
            { user ? (
                <Button variant="ghost" className="relative h-14 w-14 rounded-full">
                    <Avatar className="h-14 w-14">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback><UserIcon /></AvatarFallback>
                    </Avatar>
                </Button>
            ) : (
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
            )}
        </SheetTrigger>
        <SheetContent>
            <SheetHeader>
                <SheetTitle asChild>
                     <Link href="/" className="flex items-center" onClick={() => setSheetOpen(false)}>
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        <span className="ml-2 text-2xl font-bold">CipherLock</span>
                    </Link>
                </SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-4">
                {user ? (
                    <>
                        <div className="flex items-center gap-4 px-4 py-2 bg-secondary rounded-lg">
                             <Avatar className="h-14 w-14">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                <AvatarFallback><UserIcon /></AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-medium leading-none">{user.displayName}</p>
                                <p className="text-sm leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <Separator />
                         <Button asChild variant="ghost" className="justify-start text-lg h-14" onClick={() => setSheetOpen(false)}>
                            <Link href="/activity"><History className="mr-3"/>Activity Log</Link>
                        </Button>
                        <Button asChild variant="ghost" className="justify-start text-lg h-14" onClick={() => setSheetOpen(false)}>
                            <Link href="/keys"><KeyRound className="mr-3"/>Key Management</Link>
                        </Button>
                        <Button asChild variant="ghost" className="justify-start text-lg h-14" onClick={() => setSheetOpen(false)}>
                            <Link href="/security-center"><ShieldAlert className="mr-3"/>Security Center</Link>
                        </Button>
                        <Separator />
                         <Button variant="ghost" className="justify-start text-lg h-14" onClick={() => {signOut(); setSheetOpen(false);}}>
                            <LogOut className="mr-3"/>Log Out
                        </Button>
                    </>
                ) : (
                    <Button asChild size="lg" className="h-14 text-lg rounded-full" onClick={() => setSheetOpen(false)}>
                        <Link href="/auth">Sign In</Link>
                    </Button>
                )}
            </div>
        </SheetContent>
    </Sheet>
  )

  const DesktopMenu = () => (
    <>
      {user ? (
        <>
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="icon" className="rounded-full h-14 w-14">
                        <Link href="/activity"><History /></Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Activity Log</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-14 w-14 rounded-full">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback>
                      <UserIcon />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-lg font-medium leading-none">{user.displayName}</p>
                    <p className="text-base leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-base cursor-pointer">
                <Link href="/keys">
                  <KeyRound className="mr-2 h-5 w-5" />
                  <span>Key Management</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-base cursor-pointer">
                <Link href="/security-center">
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  <span>Security Center</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-base cursor-pointer">
                <LogOut className="mr-2 h-5 w-5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <ThemeToggle />
          <Button asChild size="lg" className="h-14 text-lg rounded-full">
              <Link href="/auth">Sign In</Link>
          </Button>
        </>
      )}
    </>
  )

  return (
    <header className={cn("bg-background sticky top-0 z-50 transition-all", isScrolled && "border-b border-border/40")}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-bold">CipherLock</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          {isMobile ? (
            user ? <MobileMenu /> : (
              <>
                <ThemeToggle />
                <Button asChild size="lg" className="h-14 text-lg rounded-full">
                    <Link href="/auth">Sign In</Link>
                </Button>
              </>
            )
          ) : (
            <DesktopMenu />
          )}
        </div>
      </nav>
    </header>
  );
}
