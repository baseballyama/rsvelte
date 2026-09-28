import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Notification_settings($$renderer) {
	const rows = [0, 1, 2, 3];

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-32 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-64 rounded-md' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'flex flex-col gap-4',
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(rows);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let row = each_array[$$index];

						$$renderer.push(`<div class="flex items-start gap-3">`);
						Skeleton($$renderer, { class: 'size-4 rounded-sm' });
						$$renderer.push(`<!----> <div class="flex flex-1 flex-col gap-2">`);
						Skeleton($$renderer, { class: 'h-4 w-40 rounded-md' });
						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'h-3 w-56 rounded-md' });
						$$renderer.push(`<!----></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
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