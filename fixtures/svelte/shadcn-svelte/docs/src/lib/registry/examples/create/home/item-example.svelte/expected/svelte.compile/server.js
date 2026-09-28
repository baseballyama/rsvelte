import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Item_example($$renderer) {
	Example($$renderer, {
		title: 'Item',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex w-full max-w-md flex-col gap-6">`);

			if (Item.Root) {
				$$renderer.push('<!--[-->');

				Item.Root($$renderer, {
					variant: 'outline',
					children: ($$renderer) => {
						if (Item.Content) {
							$$renderer.push('<!--[-->');

							Item.Content($$renderer, {
								children: ($$renderer) => {
									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Two-factor authentication`);
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
											class: 'text-pretty xl:hidden 2xl:block',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Verify via email or phone number.`);
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
										variant: 'secondary',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Enable`);
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

			$$renderer.push(` `);

			{
				function child($$renderer, { props }) {
					$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

					if (Item.Media) {
						$$renderer.push('<!--[-->');

						Item.Media($$renderer, {
							variant: 'icon',
							children: ($$renderer) => {
								IconPlaceholder($$renderer, {
									lucide: 'ShoppingBagIcon',
									tabler: 'IconShoppingBag',
									hugeicons: 'ShoppingBasket01Icon',
									phosphor: 'BagIcon',
									remixicon: 'RiShoppingBagLine'
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

					if (Item.Content) {
						$$renderer.push('<!--[-->');

						Item.Content($$renderer, {
							children: ($$renderer) => {
								if (Item.Title) {
									$$renderer.push('<!--[-->');

									Item.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Your order has been shipped.`);
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

					$$renderer.push(`</a>`);
				}

				if (Item.Root) {
					$$renderer.push('<!--[-->');

					Item.Root($$renderer, {
						variant: 'outline',
						size: 'sm',
						child,
						$$slots: { child: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`</div>`);
		},
		$$slots: { default: true }
	});
}