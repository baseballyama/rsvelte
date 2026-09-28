import * as $ from 'svelte/internal/server';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Skeleton_demo($$renderer) {
	$$renderer.push(`<div class="flex items-center space-x-4">`);
	Skeleton($$renderer, { class: 'size-12 rounded-full' });
	$$renderer.push(`<!----> <div class="space-y-2">`);
	Skeleton($$renderer, { class: 'h-4 w-[250px]' });
	$$renderer.push(`<!----> `);
	Skeleton($$renderer, { class: 'h-4 w-[200px]' });
	$$renderer.push(`<!----></div></div>`);
}