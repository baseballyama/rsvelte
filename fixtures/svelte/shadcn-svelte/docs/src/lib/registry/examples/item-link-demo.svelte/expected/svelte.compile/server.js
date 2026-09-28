import * as $ from 'svelte/internal/server';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import * as Item from "$lib/registry/ui/item/index.js";

export default function Item_link_demo($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-md flex-col gap-4">`);

	{
		function child($$renderer, { props }) {
			$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

			if (Item.Content) {
				$$renderer.push('<!--[-->');

				Item.Content($$renderer, {
					children: ($$renderer) => {
						if (Item.Title) {
							$$renderer.push('<!--[-->');

							Item.Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Visit our documentation`);
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
									$$renderer.push(`<!---->Learn how to get started with our components.`);
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
						ChevronRightIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</a>`);
		}

		if (Item.Root) {
			$$renderer.push('<!--[-->');
			Item.Root($$renderer, { child, $$slots: { child: true } });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(` `);

	{
		function child($$renderer, { props }) {
			$$renderer.push(`<a${$.attributes({
				href: '#/',
				target: '_blank',
				rel: 'noopener noreferrer',
				...props
			})}>`);

			if (Item.Content) {
				$$renderer.push('<!--[-->');

				Item.Content($$renderer, {
					children: ($$renderer) => {
						if (Item.Title) {
							$$renderer.push('<!--[-->');

							Item.Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->External resource`);
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
									$$renderer.push(`<!---->Opens in a new tab with security attributes.`);
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
						ExternalLinkIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</a>`);
		}

		if (Item.Root) {
			$$renderer.push('<!--[-->');
			Item.Root($$renderer, { variant: 'outline', child, $$slots: { child: true } });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(`</div>`);
}