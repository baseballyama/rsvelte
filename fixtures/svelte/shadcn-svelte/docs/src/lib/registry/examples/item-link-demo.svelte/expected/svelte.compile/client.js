import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import * as Item from "$lib/registry/ui/item/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a><!> <!></a>`);
var root_2 = $.from_html(`<div class="flex w-full max-w-md flex-col gap-4"><!> <!></div>`);

export default function Item_link_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	{
		const child = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;
			var a = root_1();

			$.attribute_effect(a, () => ({ href: '#/', ...props() }));

			var node_1 = $.child(a);

			$.component(node_1, () => Item.Content, ($$anchor, Item_Content) => {
				Item_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment = root();
						var node_2 = $.first_child(fragment);

						$.component(node_2, () => Item.Title, ($$anchor, Item_Title) => {
							Item_Title($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Visit our documentation');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Item.Description, ($$anchor, Item_Description) => {
							Item_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Learn how to get started with our components.');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_1, 2);

			$.component(node_4, () => Item.Actions, ($$anchor, Item_Actions) => {
				Item_Actions($$anchor, {
					children: ($$anchor, $$slotProps) => {
						ChevronRightIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.reset(a);
			$.append($$anchor, a);
		};

		$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
			Item_Root($$anchor, { child, $$slots: { child: true } });
		});
	}

	var node_5 = $.sibling(node, 2);

	{
		const child = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;
			var a_1 = root_1();

			$.attribute_effect(a_1, () => ({
				href: '#/',
				target: '_blank',
				rel: 'noopener noreferrer',
				...props()
			}));

			var node_6 = $.child(a_1);

			$.component(node_6, () => Item.Content, ($$anchor, Item_Content_1) => {
				Item_Content_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_7 = $.first_child(fragment_2);

						$.component(node_7, () => Item.Title, ($$anchor, Item_Title_1) => {
							Item_Title_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('External resource');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Item.Description, ($$anchor, Item_Description_1) => {
							Item_Description_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Opens in a new tab with security attributes.');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_9 = $.sibling(node_6, 2);

			$.component(node_9, () => Item.Actions, ($$anchor, Item_Actions_1) => {
				Item_Actions_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						ExternalLinkIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.reset(a_1);
			$.append($$anchor, a_1);
		};

		$.component(node_5, () => Item.Root, ($$anchor, Item_Root_1) => {
			Item_Root_1($$anchor, { variant: 'outline', child, $$slots: { child: true } });
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}