import * as $ from 'svelte/internal/server';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Skeleton_form($$renderer) {
	Example($$renderer, {
		title: 'Form',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex w-full flex-col gap-7"><div class="flex flex-col gap-3">`);
			Skeleton($$renderer, { class: 'h-4 w-20' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-10 w-full' });
			$$renderer.push(`<!----></div> <div class="flex flex-col gap-3">`);
			Skeleton($$renderer, { class: 'h-4 w-24' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-10 w-full' });
			$$renderer.push(`<!----></div> `);
			Skeleton($$renderer, { class: 'h-9 w-24' });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}