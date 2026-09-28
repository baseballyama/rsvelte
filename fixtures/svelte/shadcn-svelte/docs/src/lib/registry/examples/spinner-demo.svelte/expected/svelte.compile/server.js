import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Spinner_demo($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">`);

	if (Item.Root) {
		$$renderer.push('<!--[-->');

		Item.Root($$renderer, {
			variant: 'muted',
			children: ($$renderer) => {
				if (Item.Media) {
					$$renderer.push('<!--[-->');

					Item.Media($$renderer, {
						children: ($$renderer) => {
							Spinner($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Item.Content) {
					$$renderer.push('<!--[-->');

					Item.Content($$renderer, {
						children: ($$renderer) => {
							if (Item.Title) {
								$$renderer.push('<!--[-->');

								Item.Title($$renderer, {
									class: 'line-clamp-1',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Processing payment...`);
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

				$$renderer.push(` `);

				if (Item.Content) {
					$$renderer.push('<!--[-->');

					Item.Content($$renderer, {
						class: 'flex-none justify-end',
						children: ($$renderer) => {
							$$renderer.push(`<span class="text-sm tabular-nums">$100.00</span>`);
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

	$$renderer.push(`</div>`);
}