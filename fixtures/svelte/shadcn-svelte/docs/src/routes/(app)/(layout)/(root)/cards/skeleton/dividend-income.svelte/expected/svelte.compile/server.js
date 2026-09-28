import * as $ from 'svelte/internal/server';
import { Card, CardAction, CardContent, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Dividend_income($$renderer) {
	const rows = [0, 1, 2, 3];
	const miniBars = [40, 60, 80, 50];

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-48 rounded-md' });
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
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-2"><!--[-->`);

					const each_array = $.ensure_array_like(rows);

					for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
						let row = each_array[$$index_1];

						$$renderer.push(`<div class="flex items-center gap-3 rounded-xl bg-muted p-3"><div class="flex flex-1 flex-col gap-2">`);
						Skeleton($$renderer, { class: 'h-4 w-28 rounded-md bg-muted-foreground/15' });
						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'h-3 w-20 rounded-md bg-muted-foreground/15' });
						$$renderer.push(`<!----></div> <div class="hidden h-8 w-24 items-end gap-1 md:flex"><!--[-->`);

						const each_array_1 = $.ensure_array_like(miniBars);

						for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
							let h = each_array_1[i];

							Skeleton($$renderer, {
								class: 'flex-1 rounded-t-sm rounded-b-none bg-muted-foreground/15',
								style: `height: ${h}%`
							});
						}

						$$renderer.push(`<!--]--></div> `);

						Skeleton($$renderer, {
							class: 'hidden h-4 w-16 rounded-md bg-muted-foreground/15 md:block'
						});

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