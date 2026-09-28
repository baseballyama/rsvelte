import * as $ from 'svelte/internal/server';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Skeleton_avatar($$renderer) {
	Example($$renderer, {
		title: 'Avatar',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex w-full items-center gap-4">`);
			Skeleton($$renderer, { class: 'size-10 shrink-0 rounded-full' });
			$$renderer.push(`<!----> <div class="grid gap-2">`);
			Skeleton($$renderer, { class: 'h-4 w-[150px]' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-4 w-[100px]' });
			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}