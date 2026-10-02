import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Payout_threshold($$renderer) {
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
					Skeleton($$renderer, { class: 'h-3 w-32 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----></div> <div class="flex flex-col gap-3"><div class="flex items-baseline justify-between">`);
					Skeleton($$renderer, { class: 'h-3 w-40 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-7 w-24 rounded-md' });
					$$renderer.push(`<!----></div> `);
					Skeleton($$renderer, { class: 'h-2 w-full rounded-full' });
					$$renderer.push(`<!----> <div class="flex items-center justify-between">`);
					Skeleton($$renderer, { class: 'h-3 w-16 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-3 w-20 rounded-md' });
					$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-2">`);
					Skeleton($$renderer, { class: 'h-3 w-16 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-[100px] w-full rounded-lg' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}