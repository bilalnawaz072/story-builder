// 'use client';

// import { useMemo, useState } from 'react';
// import { toast } from 'sonner';
// import { Share2, Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Story, StoryMember, User } from '@/prisma/generated/client';
// import { useDebounceCallback } from 'usehooks-ts'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';

// // Define a more specific type for the members prop
// type StoryMemberWithUser = StoryMember & {
//     user: User;
// };

// interface ShareStoryButtonProps {
//     story: Story;
//     currentMembers: StoryMemberWithUser[];
// }

// export function ShareStoryButton({ story, currentMembers }: ShareStoryButtonProps) {
//     const [isOpen, setIsOpen] = useState(false);
//     const [results, setResults] = useState<User[]>([]);
//     const [isLoading, setIsLoading] = useState(false);

//     // KEY CHANGE: Create a quick-lookup Set of current member IDs
//     const memberIds = useMemo(() => new Set(currentMembers.map(m => m.userId)), [currentMembers]);


//     const handleSearch = useDebounceCallback(async (query: string) => {
//         if (query.length < 3) {
//             setResults([]);
//             return;
//         }
//         setIsLoading(true);
//         try {
//             const response = await fetch(`/api/users/search?email=${query}`);
            
//             if (!response.ok) {
//                 throw new Error("Failed to search for users.");
//             }

//             const users = await response.json();
//             setResults(users);
//         } catch (error) {
//             console.error(error);
//             toast.error("An error occurred while searching for users.");
//         } finally {
//             setIsLoading(false);
//         }
//     }, 300);

//     const handleAddMember = async (userId: string) => {
//         try {
//             const response = await fetch(`/api/stories/${story.id}/members`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ userId: userId, role: 'EDITOR' })
//             });

//             if (!response.ok) {
//                  const errorData = await response.json();
//                  throw new Error(errorData.error || "Failed to add user.");
//             }

//             toast.success("User added to the story!");
//             setIsOpen(false);
//         } catch (error: any) {
//             toast.error(error.message || "An unknown error occurred.");
//         }
//     };
    
//     return (
//         <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogTrigger asChild>
//             <Button>
//                 <Share2 className="mr-2 h-4 w-4" /> Share
//             </Button>
//         </DialogTrigger>
//         <DialogContent>
//             <DialogHeader>
//                 <DialogTitle>Share "{story.title}"</DialogTitle>
//                 <DialogDescription>
//                     Invite other registered users to collaborate on this story.
//                 </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4">
//                 {/* NEW SECTION: Display current members */}
//                 <div>
//                     <h4 className="font-medium mb-2">Current Members</h4>
//                     <div className="space-y-2">
//                         {currentMembers.map(member => (
//                             <div key={member.id} className="flex items-center justify-between">
//                                 <div className="flex items-center gap-2">
//                                     <Avatar className="h-8 w-8">
//                                         <AvatarImage src={member.user.image ?? undefined} />
//                                         <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
//                                     </Avatar>
//                                     <div>
//                                         <p className="font-semibold">{member.user.name}</p>
//                                         <p className="text-sm text-muted-foreground">{member.user.email}</p>
//                                     </div>
//                                 </div>
//                                 <Badge variant="secondary">{member.role}</Badge>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//                 {/* Search and add new members */}
//                 <div>
//                     <h4 className="font-medium mb-2">Add New Members</h4>
//                     <Input 
//                         placeholder="Search for user by email..."
//                         onChange={(e) => handleSearch(e.target.value)}
//                     />
//                     <div className="mt-4 space-y-2 min-h-[60px]">
//                         {isLoading && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}
//                         {!isLoading && results.map(user => {
//                             // KEY CHANGE: Check if the searched user is already a member
//                             const isAlreadyMember = memberIds.has(user.id);
//                             return (
//                                 <div key={user.id} className="flex justify-between items-center p-2 rounded-md hover:bg-accent">
//                                     <div className="flex items-center gap-2">
//                                         <Avatar className="h-8 w-8">
//                                             <AvatarImage src={user.image ?? undefined} />
//                                             <AvatarFallback>{user.name?.[0]}</AvatarFallback>
//                                         </Avatar>
//                                         <div>
//                                             <p className="font-medium">{user.name}</p>
//                                             <p className="text-sm text-muted-foreground">{user.email}</p>
//                                         </div>
//                                     </div>
//                                     <Button size="sm" onClick={() => handleAddMember(user.id)} disabled={isAlreadyMember}>
//                                         {isAlreadyMember ? 'Already a member' : 'Add as Editor'}
//                                     </Button>
//                                 </div>
//                             )
//                         })}
//                     </div>
//                 </div>
//             </div>
//         </DialogContent>
//     </Dialog>
//     );
// }