import { notFound } from 'next/navigation';

interface ViewerPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Viewer: {slug}</h1>
      <p>Viewing content for slug: {slug}</p>
    </div>
  );
}