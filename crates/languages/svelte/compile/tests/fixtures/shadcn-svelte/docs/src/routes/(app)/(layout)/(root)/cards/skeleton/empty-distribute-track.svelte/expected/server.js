import * as $ from 'svelte/internal/server';
import { Card, CardContent } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Empty_distribute_track($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col items-center gap-4 p-4">`);
					Skeleton($$renderer, { class: 'size-12 rounded-xl' });
					$$renderer.push(`<!----> <div class="flex flex-col items-center gap-2">`);
					Skeleton($$renderer, { class: 'h-5 w-40 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-3 w-64 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-3 w-48 rounded-md' });
					$$renderer.push(`<!----></div> `);
					Skeleton($$renderer, { class: 'h-9 w-32 rounded-lg' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}