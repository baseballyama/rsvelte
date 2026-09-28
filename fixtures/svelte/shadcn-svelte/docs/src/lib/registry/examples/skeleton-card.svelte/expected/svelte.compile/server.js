import * as $ from 'svelte/internal/server';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Skeleton_card($$renderer) {
	$$renderer.push(`<div class="flex flex-col space-y-3">`);
	Skeleton($$renderer, { class: 'h-[125px] w-[250px] rounded-xl' });
	$$renderer.push(`<!----> <div class="space-y-2">`);
	Skeleton($$renderer, { class: 'h-4 w-[250px]' });
	$$renderer.push(`<!----> `);
	Skeleton($$renderer, { class: 'h-4 w-[200px]' });
	$$renderer.push(`<!----></div></div>`);
}