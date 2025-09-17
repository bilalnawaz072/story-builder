'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Share2, Loader2, Trash2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Role, Story, StoryMember, User } from '@/prisma/generated/client';


// Define a more specific type for the members prop to include the nested user
type StoryMemberWithUser = StoryMember & { user: User };
// Define a type for the story prop that includes the owner and members
type StoryWithOwnerAndMembers = Story & { owner: User, members: StoryMemberWithUser[] };

interface ShareStoryButtonProps {
    story: StoryWithOwnerAndMembers;
}

export function ShareStoryButton({ story }: ShareStoryButtonProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<User[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [currentMembers, setCurrentMembers] = useState(story.members);

    // Effect to re-sync state if the underlying props change (e.g., after a router.refresh())
    useEffect(() => {
        setCurrentMembers(story.members);
    }, [story.members]);

    // Create a Set of all member IDs (including the owner) for instant lookups
    const memberIds = useMemo(() => new Set(currentMembers.map(m => m.userId).concat(story.ownerId)), [currentMembers, story.ownerId]);

    const handleSearch = useDebouncedCallback(async (query: string) => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        setIsLoadingSearch(true);
        try {
            const response = await fetch(`/api/users/search?email=${query}`);
            if (!response.ok) throw new Error("Search failed.");
            const users = await response.json();
            setResults(users);
        } catch (error) {
            toast.error("User search failed.");
        } finally {
            setIsLoadingSearch(false);
        }
    }, 300);

    const handleAddMember = async (userToAdd: User) => {
        setProcessingId(userToAdd.id);
        try {
            const response = await fetch(`/api/stories/${story.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userToAdd.id, role: 'EDITOR' })
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || "Failed to add user.");
            }
            toast.success(`"${userToAdd.name}" has been added to the story!`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Could not add user.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleUpdateRole = async (memberId: string, role: Role) => {
        const originalMembers = [...currentMembers];
        const updatedMembers = currentMembers.map(m => m.id === memberId ? { ...m, role: role } : m);
        setCurrentMembers(updatedMembers); // Optimistic update for instant UI feedback

        setProcessingId(memberId);
        try {
            const response = await fetch(`/api/stories/${story.id}/members/${memberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role })
            });
            if (!response.ok) throw new Error("Failed to update role.");
            toast.success("Member role updated.");
        } catch (error) {
            toast.error("Could not update role.");
            setCurrentMembers(originalMembers); // Revert UI on failure
        } finally {
            setProcessingId(null);
            router.refresh(); // Re-sync with server state
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        setProcessingId(memberId);
        try {
            const response = await fetch(`/api/stories/${story.id}/members/${memberId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Failed to remove member.");
            toast.success("Member removed from story.");
            router.refresh();
        } catch (error) {
            toast.error("Could not remove member.");
        } finally {
            setProcessingId(null);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Share "{story.title}"</DialogTitle>
                    <DialogDescription>
                        Manage who has access to this story.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-medium mb-2 text-sm">Current Members</h4>
                        <div className="space-y-2">
                            {/* Display the story owner */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-grow overflow-hidden">
                                    <Avatar className="h-8 w-8"><AvatarImage src={story.owner.image ?? undefined} /><AvatarFallback>{story.owner.name?.[0]}</AvatarFallback></Avatar>
                                    <div>
                                        <p className="font-semibold text-sm truncate">{story.owner.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{story.owner.email}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="flex-shrink-0">Owner</Badge>
                            </div>
                            
                            {/* Display collaborators */}
                            {currentMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-grow overflow-hidden">
                                        <Avatar className="h-8 w-8"><AvatarImage src={member.user.image ?? undefined} /><AvatarFallback>{member.user.name?.[0]}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="font-semibold text-sm truncate">{member.user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {processingId === member.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                <Select value={member.role} onValueChange={(role: Role) => handleUpdateRole(member.id, role)}>
                                                    <SelectTrigger className="w-[110px] text-xs h-8"><SelectValue /></SelectTrigger>
                                                    <SelectContent><SelectItem value="EDITOR">Editor</SelectItem><SelectItem value="VIEWER">Viewer</SelectItem></SelectContent>
                                                </Select>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Remove {member.user.name}?</AlertDialogTitle><AlertDialogDescription>They will lose all access to this story.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>Confirm Remove</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2 text-sm">Add New Members</h4>
                        <Input placeholder="Search for user by email..." onChange={(e) => handleSearch(e.target.value)} />
                        <div className="mt-4 space-y-2 min-h-[60px]">
                            {isLoadingSearch && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}
                            {!isLoadingSearch && results.map(user => {
                                const isAlreadyMember = memberIds.has(user.id);
                                return (
                                    <div key={user.id} className="flex justify-between items-center p-2 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8"><AvatarImage src={user.image ?? undefined} /><AvatarFallback>{user.name?.[0]}</AvatarFallback></Avatar>
                                            <div>
                                                <p className="font-semibold text-sm">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => handleAddMember(user)} disabled={isAlreadyMember || processingId === user.id}>
                                            {processingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isAlreadyMember ? 'Already a member' : 'Add as Editor'}
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}