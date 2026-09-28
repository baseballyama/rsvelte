import * as $ from 'svelte/internal/server';
import { ArrowRightIcon } from "@lucide/svelte";
import { badgeVariants } from "$lib/registry/ui/badge/index.js";
import { cn } from "$lib/utils.js";

export default function Announcement($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a href="/docs/changelog"${$.attr_class($.clsx(cn(badgeVariants({ variant: "secondary", class: "bg-muted" }))))}>Introducing Rhea `);
		ArrowRightIcon($$renderer, {});
		$$renderer.push(`<!----></a>`);
	});
}