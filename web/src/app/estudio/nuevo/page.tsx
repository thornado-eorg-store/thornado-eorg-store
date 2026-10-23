import { ReleaseForm } from "@/components/estudio/release-form";
import { PersistenceWarning } from "@/components/estudio/persistence-warning";

export default function NuevoReleasePage() {
  return (
    <>
      <PersistenceWarning />
      <ReleaseForm />
    </>
  );
}
