import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Savings_targets($$renderer) {
	const rows = [0, 1];

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-36 rounded-md' });
					$$renderer.push(`<!----> <div class="flex flex-col gap-1.5">`);
					Skeleton($$renderer, { class: 'h-4 w-full max-w-64 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-48 rounded-md' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-3"><!--[-->`);

					const each_array = $.ensure_array_like(rows);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let row = each_array[$$index];

						$$renderer.push(`<div class="flex flex-col gap-3 rounded-xl bg-muted p-4">`);
						Skeleton($$renderer, { class: 'h-3 w-24 rounded-md bg-muted-foreground/15' });
						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'h-8 w-36 rounded-md bg-muted-foreground/15' });
						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'h-2 w-full rounded-full bg-muted-foreground/15' });
						$$renderer.push(`<!----> <div class="flex items-center justify-between">`);
						Skeleton($$renderer, { class: 'h-3 w-24 rounded-md bg-muted-foreground/15' });
						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'h-3 w-20 rounded-md bg-muted-foreground/15' });
						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'justify-center',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-3 w-56 rounded-md' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}