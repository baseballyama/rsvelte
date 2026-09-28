import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Account_access($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-36 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-64 rounded-md' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'flex flex-col gap-6',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-2">`);
					Skeleton($$renderer, { class: 'h-3 w-24 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----></div> <div class="flex flex-col gap-2"><div class="flex items-center justify-between">`);
					Skeleton($$renderer, { class: 'h-3 w-32 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-3 w-12 rounded-md' });
					$$renderer.push(`<!----></div> `);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'flex-col gap-4',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-14 w-full rounded-xl' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}