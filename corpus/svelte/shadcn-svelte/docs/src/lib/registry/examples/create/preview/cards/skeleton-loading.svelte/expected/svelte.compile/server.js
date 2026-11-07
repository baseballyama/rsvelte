import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

export default function Skeleton_loading($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						class: 'flex flex-col gap-4',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex items-center gap-3">`);
							Skeleton($$renderer, { class: 'size-10 rounded-full' });
							$$renderer.push(`<!----> <div class="flex flex-1 flex-col gap-2">`);
							Skeleton($$renderer, { class: 'h-4 w-3/4' });
							$$renderer.push(`<!----> `);
							Skeleton($$renderer, { class: 'h-3 w-1/2' });
							$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-2">`);
							Skeleton($$renderer, { class: 'h-3 w-full' });
							$$renderer.push(`<!----> `);
							Skeleton($$renderer, { class: 'h-3 w-full' });
							$$renderer.push(`<!----> `);
							Skeleton($$renderer, { class: 'h-3 w-4/5' });
							$$renderer.push(`<!----></div> <div class="flex gap-2">`);
							Skeleton($$renderer, { class: 'h-8 w-20' });
							$$renderer.push(`<!----> `);
							Skeleton($$renderer, { class: 'h-8 w-20' });
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