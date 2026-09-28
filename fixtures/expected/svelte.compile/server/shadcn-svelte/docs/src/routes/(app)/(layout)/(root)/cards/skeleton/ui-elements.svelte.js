import * as $ from 'svelte/internal/server';
import { Card, CardContent } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Ui_elements($$renderer) {
	Card($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			CardContent($$renderer, {
				class: 'flex flex-col gap-6',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-8 w-full rounded-2xl' });
					$$renderer.push(`<!----> <div class="flex flex-wrap gap-2">`);
					Skeleton($$renderer, { class: 'h-9 w-20 rounded-lg' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-24 rounded-lg' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-20 rounded-lg' });
					$$renderer.push(`<!----></div> <div class="flex flex-col gap-3">`);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-20 w-full rounded-lg' });
					$$renderer.push(`<!----></div> <div class="flex items-center gap-2"><div class="flex gap-2">`);
					Skeleton($$renderer, { class: 'h-5 w-12 rounded-full' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-5 w-16 rounded-full' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'hidden h-5 w-14 rounded-full 4xl:block' });
					$$renderer.push(`<!----></div> <div class="ml-auto flex gap-3">`);
					Skeleton($$renderer, { class: 'size-4 rounded-full' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'size-4 rounded-full' });
					$$renderer.push(`<!----></div> <div class="flex gap-3">`);
					Skeleton($$renderer, { class: 'size-4 rounded-sm' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'hidden size-4 rounded-sm 4xl:block' });
					$$renderer.push(`<!----></div> `);
					Skeleton($$renderer, { class: 'ml-auto h-5 w-9 rounded-full 4xl:hidden' });
					$$renderer.push(`<!----></div> <div class="flex items-center gap-4">`);
					Skeleton($$renderer, { class: 'h-9 w-24 rounded-lg' });
					$$renderer.push(`<!----> <div class="flex">`);
					Skeleton($$renderer, { class: 'h-9 w-28 rounded-l-lg rounded-r-none' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'ml-px h-9 w-9 rounded-l-none rounded-r-lg' });
					$$renderer.push(`<!----></div> `);
					Skeleton($$renderer, { class: 'ml-auto hidden h-5 w-9 rounded-full 4xl:block' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}