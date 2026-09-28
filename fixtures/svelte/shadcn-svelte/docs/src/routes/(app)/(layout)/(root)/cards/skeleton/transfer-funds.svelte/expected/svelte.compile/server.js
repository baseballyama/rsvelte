import * as $ from 'svelte/internal/server';
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Transfer_funds($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-36 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-64 rounded-md' });
					$$renderer.push(`<!----> `);

					CardAction($$renderer, {
						children: ($$renderer) => {
							Skeleton($$renderer, { class: 'size-8 rounded-md' });
						},
						$$slots: { default: true }
					});

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
					$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);
					Skeleton($$renderer, { class: 'h-3 w-24 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----></div> <div class="flex flex-col gap-2">`);
					Skeleton($$renderer, { class: 'h-3 w-20 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-9 w-full rounded-lg' });
					$$renderer.push(`<!----></div> <div class="flex flex-col gap-3 rounded-xl bg-muted p-4"><div class="flex items-center justify-between">`);
					Skeleton($$renderer, { class: 'h-4 w-28 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-24 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----></div> `);
					Skeleton($$renderer, { class: 'h-px w-full rounded-none bg-muted-foreground/15' });
					$$renderer.push(`<!----> <div class="flex items-center justify-between">`);
					Skeleton($$renderer, { class: 'h-4 w-28 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-12 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----></div> `);
					Skeleton($$renderer, { class: 'h-px w-full rounded-none bg-muted-foreground/15' });
					$$renderer.push(`<!----> <div class="flex items-center justify-between">`);
					Skeleton($$renderer, { class: 'h-4 w-24 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-20 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----></div></div>`);
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