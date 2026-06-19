import { error } from "@sveltejs/kit";
import type { EntryGenerator, PageLoad } from "./$types";
import { GUIDES, guideById } from "$lib/docs";

// Enumerate every guide slug so adapter-static prerenders a real HTML file per
// page (build/docs/<slug>/index.html). Without this the SPA fallback would
// 404 on a direct deep link under GitHub Pages.
export const entries: EntryGenerator = () => GUIDES.map((g) => ({ slug: g.id }));

export const load: PageLoad = ({ params }) => {
  const guide = guideById(params.slug);
  if (!guide) error(404, `Unknown guide: ${params.slug}`);
  return { guide };
};
