import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";

var root = $.from_html(`<img width="128" height="128" class="aspect-square w-full rounded-sm object-cover"/>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex w-full max-w-xl flex-col gap-6"><!></div>`);

export default function Item_header_demo($$anchor) {
	const models = [
		{
			name: "v0-1.5-sm",
			description: "Everyday tasks and UI generation.",
			image: "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop",
			credit: "Valeria Reverdo on Unsplash"
		},

		{
			name: "v0-1.5-lg",
			description: "Advanced thinking or reasoning.",
			image: "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop",
			credit: "Michael Oeser on Unsplash"
		},

		{
			name: "v0-2.0-mini",
			description: "Open Source model for everyone.",
			image: "https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop",
			credit: "Cherry Laithang on Unsplash"
		}
	];

	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Item.Group, ($$anchor, Item_Group) => {
		Item_Group($$anchor, {
			class: 'grid grid-cols-3 gap-4',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.each(node_1, 17, () => models, (model) => model.name, ($$anchor, model) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Item.Root, ($$anchor, Item_Root) => {
						Item_Root($$anchor, {
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Item.Header, ($$anchor, Item_Header) => {
									Item_Header($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var img = root();

											$.template_effect(() => {
												$.set_attribute(img, 'src', $.get(model).image);
												$.set_attribute(img, 'alt', $.get(model).name);
											});

											$.append($$anchor, img);
										},
										$$slots: { default: true }
									});
								});

								var node_4 = $.sibling(node_3, 2);

								$.component(node_4, () => Item.Content, ($$anchor, Item_Content) => {
									Item_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_1();
											var node_5 = $.first_child(fragment_3);

											$.component(node_5, () => Item.Title, ($$anchor, Item_Title) => {
												Item_Title($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, $.get(model).name));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => Item.Description, ($$anchor, Item_Description) => {
												Item_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, $.get(model).description));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}