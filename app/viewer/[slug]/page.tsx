import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import ARViewer from './ARViewer';

interface ViewerPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProjectData(slug: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('data')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data.data;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const projectData = await fetchProjectData(slug);

  if (!projectData) {
    notFound();
  }

  return <ARViewer projectData={projectData} />;
}