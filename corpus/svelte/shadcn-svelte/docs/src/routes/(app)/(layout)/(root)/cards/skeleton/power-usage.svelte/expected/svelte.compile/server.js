import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Power_usage($$renderer) {
	const bars = [30, 70, 80, 60, 90, 75, 100, 85];

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-32 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-24 rounded-md' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'flex flex-col gap-4',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex h-[140px] w-full items-end gap-2"><!--[-->`);

					const each_array = $.ensure_array_like(bars);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let height = each_array[i];

						$$renderer.push(`<div class="flex h-full flex-1 flex-col justify-end gap-1.5">`);

						Skeleton($$renderer, {
							class: 'w-full rounded-t rounded-b-none',
							style: `height: ${height}%`
						});

						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'mx-auto h-3 w-5 rounded-md' });
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--></div> `);
					Skeleton($$renderer, { class: 'h-px w-full rounded-none' });
					$$renderer.push(`<!----> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-1.5">`);
					Skeleton($$renderer, { class: 'h-3 w-28 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-5 w-20 rounded-md' });
					$$renderer.push(`<!----></div> <div class="flex flex-col gap-1.5">`);
					Skeleton($$renderer, { class: 'h-3 w-20 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-5 w-24 rounded-md' });
					$$renderer.push(`<!----></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				class: 'flex-col items-start gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-3 w-24 rounded-md' });
					$$renderer.push(`<!----> <div class="flex w-full items-center gap-2">`);
					Skeleton($$renderer, { class: 'h-2 flex-1 rounded-full' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-3 w-10 rounded-md' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}