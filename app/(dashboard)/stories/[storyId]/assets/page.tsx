import { prisma } from "@/lib/prisma";
import { AssetList } from "./asset-list";

interface AssetsPageProps {
    params: { storyId: string };
}

export default async function AssetsPage({ params }: AssetsPageProps) {
    const { storyId } = await params
  const assets = await prisma.asset.findMany({
    where: { storyId: storyId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
        <AssetList initialAssets={assets} storyId={storyId} />
    </div>
  );
}