import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function New_milestone($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-44 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-72 rounded-md' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'flex flex-col gap-4',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-2">`);
					Skeleton($$renderer, { class: 'h-3 w-20 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-3"><div class="flex flex-col gap-2">`);
					Skeleton($$renderer, { class: 'h-3 w-24 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);
					Skeleton($$renderer, { class: 'h-3 w-20 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'flex-col gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}