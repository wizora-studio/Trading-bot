import { notFound } from "next/navigation";
import { ComponentGallery } from "@/features/devgallery/ComponentGallery";

/** /dev/components — only in `npm run dev`; the production build returns 404. */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ComponentGallery />;
}
