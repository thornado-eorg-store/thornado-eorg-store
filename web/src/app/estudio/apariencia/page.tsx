// ============================================================
// /estudio/apariencia — editor de textos, orden de secciones
// y fondo visual del sitio público.
// ============================================================
import { getSiteConfigAdmin } from "@/lib/store";
import { AppearanceForm } from "@/components/estudio/appearance-form";

export default async function PaginaApariencia() {
  const config = await getSiteConfigAdmin();
  return <AppearanceForm config={config} />;
}
