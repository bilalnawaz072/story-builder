import { DocumentList } from '@/components/documents/document-list';
import { prisma } from '@/lib/prisma';

interface DocumentsPageProps {
    params: { storyId: string };
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
 
  const {storyId} = await params
 
  const documents = await prisma.document.findMany({
    where: { storyId: storyId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
        <DocumentList initialDocuments={documents} storyId={storyId} />
    </div>
  );
}