'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PutBlobResult } from '@vercel/blob';
import { toast } from 'sonner';
import { Upload, Trash2, FileText, Loader2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExtractedDataViewer } from './extracted-data-viewer';
import { Document, DocumentStatus } from '@/prisma/generated/client';
import { useStoryRole } from '../providers/story-role-provider';

interface DocumentListProps {
    initialDocuments: Document[];
    storyId: string;
}

const StatusIcon = ({ status }: { status: DocumentStatus }) => {
    switch (status) {
        case 'PROCESSING':
            return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
        case 'COMPLETED':
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'FAILED':
            return <XCircle className="h-5 w-5 text-red-500" />;
        case 'UPLOADED':
        default:
            return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
}

export function DocumentList({ initialDocuments, storyId }: DocumentListProps) {
    const router = useRouter();
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [documents, setDocuments] = useState(initialDocuments);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { role } = useStoryRole();
    const isViewer = role === 'VIEWER';





    useEffect(() => {
        setDocuments(initialDocuments);
        const isProcessing = initialDocuments.some(doc => doc.status === 'PROCESSING' || doc.status === 'UPLOADED');

        if (isProcessing) {
            const interval = setInterval(() => {
                router.refresh();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [initialDocuments, router]);

    const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
        // ... This function is unchanged
        event.preventDefault();
        if (!inputFileRef.current?.files) {
            throw new Error("No file selected");
        }

        const file = inputFileRef.current.files[0];
        setIsUploading(true);

        try {
            const uploadResponse = await fetch(
                `/api/stories/${storyId}/documents/upload?filename=${file.name}`,
                { method: 'POST', body: file }
            );
            const newBlob = (await uploadResponse.json()) as PutBlobResult;

            const dbResponse = await fetch(`/api/stories/${storyId}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newBlob.pathname, url: newBlob.url }),
            });

            if (!dbResponse.ok) throw new Error("Failed to save document record.");

            toast.success("File uploaded successfully! Processing will begin shortly.");
            router.refresh();

        } catch (error) {
            console.error(error);
            toast.error("An error occurred during upload.");
        } finally {
            setIsUploading(false);
            if (inputFileRef.current) inputFileRef.current.value = "";
        }
    };

    const handleDelete = async (documentId: string) => {
        setDeletingId(documentId);
        try {
            const response = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete document.');
            }
            toast.success("Document deleted.");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete document.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Document Library</h2>
                <p className="text-muted-foreground">Upload source documents like research papers or journals. The AI will extract key info to help build your story.</p>
            </div>

            {!isViewer && (
            <form onSubmit={handleUpload} className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Upload a document</h3>
                <p className="mt-1 text-sm text-muted-foreground">TXT or PDF (max 10MB).</p>
                <input name="file" ref={inputFileRef} type="file" required className="..."/>
                <Button type="submit" disabled={isUploading} className="mt-4">
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
            </form>
        )}

            <div className="space-y-3">
                <Accordion type="single" collapsible className="w-full">
                    {documents.map((doc) => (
                        <AccordionItem value={doc.id} key={doc.id} className="border rounded-md px-3">
                            <div className="flex items-center justify-between py-1">
                                <AccordionTrigger disabled={doc.status !== 'COMPLETED' || !doc.extractedData} className="flex-1 text-left py-2 hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <StatusIcon status={doc.status} />
                                        <span className="font-medium">{doc.name}</span>
                                        <Badge variant={
                                            doc.status === 'COMPLETED' ? 'default' :
                                                doc.status === 'FAILED' ? 'destructive' : 'secondary'
                                        }>
                                            {doc.status}
                                        </Badge>
                                        {doc.status === 'COMPLETED' && doc.extractedData && (
                                            <span className="text-xs text-muted-foreground">(View Suggestions)</span>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                {!isViewer && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(doc.id)} 
                                disabled={doc.status === 'PROCESSING' || deletingId === doc.id}
                                className="ml-2 flex-shrink-0"
                            >
                                {deletingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        )}
                            </div>
                            <AccordionContent>
                                <ExtractedDataViewer storyId={storyId} extractedData={doc.extractedData} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}