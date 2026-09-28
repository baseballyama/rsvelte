import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Loading_card($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							Skeleton($$renderer, { class: 'h-5 w-32' });
							$$renderer.push(`<!----> `);
							Skeleton($$renderer, { class: 'h-4 w-48' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						class: 'flex flex-col gap-4',
						children: ($$renderer) => {
							Skeleton($$renderer, { class: 'h-32 w-full rounded-lg' });
							$$renderer.push(`<!----> <div class="flex flex-col gap-2">`);
							Skeleton($$renderer, { class: 'h-4 w-full' });
							$$renderer.push(`<!----> `);
							Skeleton($$renderer, { class: 'h-4 w-3/4' });
							$$renderer.push(`<!----> `);
							Skeleton($$renderer, { class: 'h-4 w-1/2' });
							$$renderer.push(`<!----></div> <div class="flex gap-2">`);
							Skeleton($$renderer, { class: 'h-9 flex-1 rounded-md' });
							$$renderer.push(`<!----> `);
							Skeleton($$renderer, { class: 'h-9 flex-1 rounded-md' });
							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}