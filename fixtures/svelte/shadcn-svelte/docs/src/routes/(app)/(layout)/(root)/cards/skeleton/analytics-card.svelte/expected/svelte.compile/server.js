import * as $ from 'svelte/internal/server';
import { Card, CardAction, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Analytics_card($$renderer) {
	Card($$renderer, {
		class: 'mx-auto w-full max-w-sm data-[size=sm]:pb-0',
		size: 'sm',
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'gap-2',
				children: ($$renderer) => {
					Skeleton($$renderer, { class: 'h-5 w-24 rounded-md' });
					$$renderer.push(`<!----> `);
					Skeleton($$renderer, { class: 'h-4 w-40 rounded-md' });
					$$renderer.push(`<!----> `);

					CardAction($$renderer, {
						children: ($$renderer) => {
							Skeleton($$renderer, { class: 'h-7 w-28 rounded-lg' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'mx-6 mb-6 aspect-[1/0.35] w-auto rounded-lg' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}