
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Unlock, KeyRound, Download, CheckCircle, Files, Save, ShieldAlert } from "lucide-react";
import CryptoJS from 'crypto-js';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SavedKey {
    id: string;
    name: string;
    key: string;
}

function dataUriToBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab]);
}

export function DecryptPanel() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([]);
  const [keyName, setKeyName] = useState('');
  const [isSaveKeyDialogOpen, setSaveKeyDialogOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
        const fetchKeys = async () => {
            const keysQuery = query(collection(db, 'users', user.uid, 'keys'));
            const querySnapshot = await getDocs(keysQuery);
            const keys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedKey));
            setSavedKeys(keys);
        };
        fetchKeys();
    }
  }, [user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSaveKey = async () => {
      if (!key || !keyName) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please provide a name for the key." });
          return;
      }
      if (user) {
          await addDoc(collection(db, 'users', user.uid, 'keys'), { name: keyName, key });
          toast({ title: "Key Saved", description: `The key "${keyName}" has been saved.` });
          setKeyName('');
          setSaveKeyDialogOpen(false);
          // Refetch keys
          const keysQuery = query(collection(db, 'users', user.uid, 'keys'));
          const querySnapshot = await getDocs(keysQuery);
          const keys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedKey));
          setSavedKeys(keys);
      }
  };

  const logActivity = async (filename: string, keyUsed: string) => {
    if (user) {
        const keyHash = CryptoJS.SHA256(keyUsed).toString();
        try {
            await addDoc(collection(db, 'users', user.uid, 'activity'), {
                action: 'decrypt',
                filename: filename,
                keyHash: keyHash,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error logging activity: ", error);
        }
    }
  }
  
  const showAlert = (title: string, description: string) => {
      setAlertTitle(title);
      setAlertDescription(description);
      setAlertOpen(true);
  }

  const handleDecrypt = () => {
    if (files.length === 0 || !key) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select one or more files and enter the secret key.",
      });
      return;
    }
    
    setLoading(true);
    let processedCount = 0;
    let successCount = 0;

    files.forEach(file => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const encryptedContent = e.target?.result as string;
            const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            
            if (!decryptedData) {
                throw new Error("Decryption failed. Wrong key or corrupted file.");
            }

            const payload = JSON.parse(decryptedData);
            const { data, name, hash: originalHash } = payload;
            
            // Anomaly detection: Verify file integrity
            const decryptedContentHash = CryptoJS.SHA256(data).toString();

            if (originalHash && decryptedContentHash !== originalHash) {
                showAlert(
                    `File Integrity Check Failed for ${file.name}`,
                    "This file may have been tampered with or corrupted since it was encrypted. The content does not match its original signature. Do not trust this file's content."
                );
                // We stop processing this file but don't throw an error that would be caught by the generic toast.
            } else {
                const blob = dataUriToBlob(data);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                successCount++;
                logActivity(file.name, key);
            }

          } catch (error: any) {
            toast({
              variant: "destructive",
              title: `Decryption Failed for ${file.name}`,
              description: error.message || "Please check your key and the file.",
            });
          } finally {
            processedCount++;
            if (processedCount === files.length) {
              setLoading(false);
              if (successCount > 0) {
                toast({
                  title: "Decryption Complete",
                  description: `${successCount} of ${files.length} file(s) decrypted successfully.`,
                });
              }
            }
          }
        };
        
        reader.onerror = () => {
            toast({
                variant: "destructive",
                title: `File Read Error for ${file.name}`,
                description: "Could not read the selected file.",
            });
            processedCount++;
            if (processedCount === files.length) {
              setLoading(false);
            }
        }
        reader.readAsText(file);
    });
  };

  const step1Completed = files.length > 0;
  const step2Completed = key.length > 0;
  
  return (
    <>
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Decrypt File(s)</CardTitle>
        <CardDescription>Select .ciph files and provide the key to decrypt them. {user && <strong>Use your saved keys!</strong>}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        
        <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step1Completed ? 'bg-primary/80' : 'bg-primary'} text-primary-foreground transition-all`}>
                {step1Completed ? <CheckCircle className="w-6 h-6" /> : <Files className="w-6 h-6" />}
                </div>
                <div className={`h-10 w-px bg-border my-1 transition-all duration-300 ${step1Completed ? 'h-24' : 'h-10'}`}></div>
            </div>
            <div className="flex-1 space-y-2 pb-10">
                <Label htmlFor="file-decrypt" className="text-lg font-semibold">Step 1: Upload .ciph File(s)</Label>
                <Input id="file-decrypt" type="file" accept=".ciph" onChange={handleFileChange} className="file:text-foreground h-12 text-base" multiple disabled={step1Completed}/>
                 {step1Completed && <p className="text-base text-muted-foreground pt-2">Selected: {files.length} file(s)</p>}
            </div>
        </div>

        <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step2Completed ? 'bg-primary/80' : !step1Completed ? 'bg-muted' : 'bg-primary'} ${!step1Completed ? 'text-muted-foreground' : 'text-primary-foreground'} transition-all`}>
                    {step2Completed ? <CheckCircle className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
                </div>
              <div className="h-10 w-px bg-border my-1"></div>
            </div>
            <div className={`flex-1 space-y-2 pb-10 transition-opacity ${step1Completed ? 'opacity-100' : 'opacity-60'}`}>
              <Label htmlFor="key-decrypt" className="text-lg font-semibold">Step 2: Enter Secret Key</Label>
               {user && savedKeys.length > 0 && (
                <Select onValueChange={(value) => setKey(value)}>
                    <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Or select a saved key" />
                    </SelectTrigger>
                    <SelectContent>
                        {savedKeys.map(savedKey => (
                            <SelectItem key={savedKey.id} value={savedKey.key}>{savedKey.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
               )}
              <div className="flex items-center gap-2">
                <Input id="key-decrypt" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter your secret key" disabled={!step1Completed} className="h-12 text-base" />
                 {user && (
                  <Dialog open={isSaveKeyDialogOpen} onOpenChange={setSaveKeyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" disabled={!key}><Save className="w-5 h-5"/></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Secret Key</DialogTitle>
                        <DialogDescription>Give this key a recognizable name to save it for later use.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="key-name">Key Name</Label>
                        <Input id="key-name" value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g., 'Work Documents Key'"/>
                      </div>
                      <DialogFooter>
                        <Button variant="secondary" onClick={() => setSaveKeyDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveKey}>Save Key</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
        </div>
        
        <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${!step1Completed || !step2Completed ? 'bg-muted' : 'bg-primary'} ${!step1Completed || !step2Completed ? 'text-muted-foreground' : 'text-primary-foreground'} transition-all`}>
                 <Download className="w-6 h-6" />
              </div>
            </div>
            <div className={`flex-1 space-y-2 transition-opacity ${step1Completed && step2Completed ? 'opacity-100' : 'opacity-60'}`}>
              <Label className="text-lg font-semibold">Step 3: Decrypt & Download</Label>
              <Button onClick={handleDecrypt} disabled={loading || !step1Completed || !step2Completed} className="w-full h-14 text-lg rounded-full">
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Unlock className="mr-2 h-6 w-6" />}
                Decrypt & Download
              </Button>
            </div>
        </div>
        
      </CardContent>
    </Card>
    <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert className="h-6 w-6" /> {alertTitle}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                    {alertDescription}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setAlertOpen(false)}>
                    Understood
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
