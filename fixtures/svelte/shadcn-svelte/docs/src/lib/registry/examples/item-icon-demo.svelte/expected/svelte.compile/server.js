import * as $ from 'svelte/internal/server';
import ShieldAlertIcon from "@lucide/svelte/icons/shield-alert";
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Item_icon_demo($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-lg flex-col gap-6">`);

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
							ShieldAlertIcon($$renderer, {});
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
										$$renderer.push(`<!---->Security Alert`);
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
										$$renderer.push(`<!---->New login detected from unknown device.`);
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
						children: ($$renderer) => {
							Button($$renderer, {
								size: 'sm',
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Review`);
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