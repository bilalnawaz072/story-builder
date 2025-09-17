import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function AnalyticsPage({ params }: { params: { storyId: string } }) {
    const {storyId} = await params;
    
    const analyticsData = await prisma.choiceAnalytics.findMany({
        where: { storyId: storyId },
        // Include the related choice to get its text content
        include: {
            choice: true,
        },
        orderBy: {
            clickCount: 'desc',
        },
    });

    if (!analyticsData) {
        return notFound();
    }
    
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Story Analytics</h2>
                <p className="text-muted-foreground">Discover which paths your readers take most often.</p>
            </div>
            <AnalyticsDashboard initialData={analyticsData} />
        </div>
    );
}