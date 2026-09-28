import * as $ from 'svelte/internal/server';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Skeleton_table($$renderer) {
	Example($$renderer, {
		title: 'Table',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex w-full flex-col gap-2"><div class="flex gap-4">`);
			Skeleton($$renderer, { class: 'h-4 flex-1' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-24' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-20' });
			$$renderer.push(`<!----></div> <div class="flex gap-4">`);
			Skeleton($$renderer, { class: 'h-4 flex-1' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-24' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-20' });
			$$renderer.push(`<!----></div> <div class="flex gap-4">`);
			Skeleton($$renderer, { class: 'h-4 flex-1' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-24' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-20' });
			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}