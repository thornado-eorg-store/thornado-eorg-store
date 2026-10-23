import { notFound } from "next/navigation";
import { allReleasesAdmin } from "@/lib/store";
import { ReleaseForm } from "@/components/estudio/release-form";
import { PersistenceWarning } from "@/components/estudio/persistence-warning";

export default async function EditarReleasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const release = (await allReleasesAdmin()).find((r) => r.slug === slug);
  if (!release) notFound();
  return (
    <>
      <PersistenceWarning />
      <ReleaseForm release={release} />
    </>
  );
}
