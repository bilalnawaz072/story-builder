'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Choice, ChoiceAnalytics } from '@/prisma/generated/client';

type AnalyticsData = ChoiceAnalytics & {
    choice: Choice;
};

interface AnalyticsDashboardProps {
    initialData: AnalyticsData[];
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
    const totalClicks = useMemo(() => {
        return initialData.reduce((sum, item) => sum + item.clickCount, 0);
    }, [initialData]);

    const chartData = useMemo(() => {
        return initialData.slice(0, 10).map(item => ({
            name: item.choice.text.length > 30 ? `${item.choice.text.substring(0, 30)}...` : item.choice.text,
            clicks: item.clickCount,
        })).reverse(); // Reverse for better chart layout
    }, [initialData]);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Total Choices Made</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{totalClicks}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Unique Paths</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{initialData.length}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Most Popular Choice</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold">{initialData[0]?.choice.text || 'N/A'}</p>
                        <p className="text-muted-foreground">{initialData[0]?.clickCount || 0} clicks</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Most Popular Choices</CardTitle>
                    <CardDescription>A visual representation of the most frequently chosen paths.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[400px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12 }} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>All Choice Data</CardTitle>
                    <CardDescription>A detailed list of all choices and their click counts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Choice Text</TableHead>
                                <TableHead className="text-right">Click Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.choice.text}</TableCell>
                                    <TableCell className="text-right font-bold">{item.clickCount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}