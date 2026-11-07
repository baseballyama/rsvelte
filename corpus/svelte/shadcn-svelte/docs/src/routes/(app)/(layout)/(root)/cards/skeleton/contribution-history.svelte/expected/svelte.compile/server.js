import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Contribution_history($$renderer) {
	const bars = [60, 80, 65, 95, 50, 100];

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-44 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-52 rounded-md' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex h-[200px] w-full items-end gap-3"><!--[-->`);

					const each_array = $.ensure_array_like(bars);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let height = each_array[i];

						$$renderer.push(`<div class="flex h-full flex-1 flex-col justify-end gap-2">`);

						Skeleton($$renderer, {
							class: 'w-full rounded-t-md rounded-b-none',
							style: `height: ${height}%`
						});

						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'mx-auto h-3 w-6 rounded-md' });
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid w-full grid-cols-1 gap-3 xl:grid-cols-2"><div class="flex flex-col gap-2 rounded-xl bg-muted p-4">`);
					Skeleton($$renderer, { class: 'h-3 w-20 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-5 w-28 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-3 w-24 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----></div> <div class="hidden flex-col gap-2 rounded-xl bg-muted p-4 xl:flex">`);
					Skeleton($$renderer, { class: 'h-3 w-24 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-5 w-32 rounded-md bg-muted-foreground/15' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-3 w-28 rounded-md bg-muted-foreground/15' });
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