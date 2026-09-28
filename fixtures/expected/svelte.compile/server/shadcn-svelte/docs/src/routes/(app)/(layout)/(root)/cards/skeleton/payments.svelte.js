import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Payments($$renderer) {
	const rows = [0, 1, 2];

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'flex flex-col gap-3',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center gap-2">`);
					Skeleton($$renderer, { class: 'h-4 w-12 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'size-1.5 rounded-full' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'size-7 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'size-1.5 rounded-full' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-20 rounded-md' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-2"><!--[-->`);

					const each_array = $.ensure_array_like(rows);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let row = each_array[$$index];

						$$renderer.push(`<div class="flex items-center gap-3 rounded-xl bg-muted p-3">`);
						Skeleton($$renderer, { class: 'size-9 rounded-lg bg-muted-foreground/15' });
						$$renderer.push(`<!----> <div class="flex flex-1 flex-col gap-2">`);
						Skeleton($$renderer, { class: 'h-4 w-40 rounded-md bg-muted-foreground/15' });
						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'h-3 w-56 rounded-md bg-muted-foreground/15' });
						$$renderer.push(`<!----></div> `);
						Skeleton($$renderer, { class: 'size-4 rounded-md bg-muted-foreground/15' });
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}