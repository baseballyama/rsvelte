import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Spinner_item_demo($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-md flex-col gap-4 [--radius:1rem]">`);

	if (Item.Root) {
		$$renderer.push('<!--[-->');

		Item.Root($$renderer, {
			variant: 'outline',
			children: ($$renderer) => {
				if (Item.Media) {
					$$renderer.push('<!--[-->');

					Item.Media($$renderer, {
						variant: 'icon',
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
									children: ($$renderer) => {
										$$renderer.push(`<!---->Downloading...`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Item.Description) {
								$$renderer.push('<!--[-->');

								Item.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->129 MB / 1000 MB`);
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

				if (Item.Actions) {
					$$renderer.push('<!--[-->');

					Item.Actions($$renderer, {
						class: 'hidden sm:flex',
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Item.Footer) {
					$$renderer.push('<!--[-->');

					Item.Footer($$renderer, {
						children: ($$renderer) => {
							Progress($$renderer, { value: 75 });
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