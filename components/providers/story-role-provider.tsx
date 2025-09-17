'use client';

import { Role } from '@/prisma/generated/client';
import { createContext, useContext } from 'react';

type StoryRoleContextType = {
    role: Role;
};

const StoryRoleContext = createContext<StoryRoleContextType | undefined>(undefined);

export function StoryRoleProvider({ children, role }: { children: React.ReactNode, role: Role }) {
    return (
        <StoryRoleContext.Provider value={{ role }}>
            {children}
        </StoryRoleContext.Provider>
    );
}

export function useStoryRole() {
    const context = useContext(StoryRoleContext);
    if (context === undefined) {
        throw new Error('useStoryRole must be used within a StoryRoleProvider');
    }
    return context;
}