import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a><!> <!></a>`);
var root_2 = $.from_html(`<div class="flex w-full max-w-md flex-col gap-6"><!> <!></div>`);

export default function Item_example($$anchor) {
	Example($$anchor, {
		title: 'Item',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
				Item_Root($$anchor, {
					variant: 'outline',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Item.Content, ($$anchor, Item_Content) => {
							Item_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_2 = $.first_child(fragment_2);

									$.component(node_2, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Two-factor authentication');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Item.Description, ($$anchor, Item_Description) => {
										Item_Description($$anchor, {
											class: 'text-pretty xl:hidden 2xl:block',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Verify via email or phone number.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Item.Actions, ($$anchor, Item_Actions) => {
							Item_Actions($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										size: 'sm',
										variant: 'secondary',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Enable');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node, 2);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					var a = root_1();

					$.attribute_effect(a, () => ({ href: '#/', ...props() }));

					var node_6 = $.child(a);

					$.component(node_6, () => Item.Media, ($$anchor, Item_Media) => {
						Item_Media($$anchor, {
							variant: 'icon',
							children: ($$anchor, $$slotProps) => {
								IconPlaceholder($$anchor, {
									lucide: 'ShoppingBagIcon',
									tabler: 'IconShoppingBag',
									hugeicons: 'ShoppingBasket01Icon',
									phosphor: 'BagIcon',
									remixicon: 'RiShoppingBagLine'
								});
							},
							$$slots: { default: true }
						});
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Item.Content, ($$anchor, Item_Content_1) => {
						Item_Content_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_8 = $.first_child(fragment_5);

								$.component(node_8, () => Item.Title, ($$anchor, Item_Title_1) => {
									Item_Title_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Your order has been shipped.');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.reset(a);
					$.append($$anchor, a);
				};

				$.component(node_5, () => Item.Root, ($$anchor, Item_Root_1) => {
					Item_Root_1($$anchor, {
						variant: 'outline',
						size: 'sm',
						child,
						$$slots: { child: true }
					});
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}