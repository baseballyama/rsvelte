import * as $ from 'svelte/internal/server';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Skeleton_text($$renderer) {
	Example($$renderer, {
		title: 'Text',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex w-full flex-col gap-2">`);
			Skeleton($$renderer, { class: 'h-4 w-full' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-full' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-3/4' });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}