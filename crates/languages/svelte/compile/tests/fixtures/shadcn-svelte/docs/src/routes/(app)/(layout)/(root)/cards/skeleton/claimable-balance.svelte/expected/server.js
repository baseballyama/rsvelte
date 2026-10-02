import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Claimable_balance($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-3',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-4 w-36 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-12 w-56 rounded-lg' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-6 w-32 rounded-full' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'flex flex-1 flex-col justify-end',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-3 rounded-xl bg-muted p-4"><div class="flex items-center justify-between">`);
					Skeleton($$renderer, { class: 'h-4 w-28 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-20 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----></div> <div class="flex items-center justify-between">`);
					Skeleton($$renderer, { class: 'h-4 w-32 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-16 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----></div> `);
					Skeleton($$renderer, { class: 'h-px w-full rounded-none bg-muted-foreground/15' });
					$$renderer.push(`<!----> <div class="flex items-center justify-between">`);
					Skeleton($$renderer, { class: 'h-4 w-36 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-24 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'flex-col gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-3 w-full rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-3 w-11/12 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-3 w-3/4 rounded-md' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}