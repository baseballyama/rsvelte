import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex w-full max-w-md flex-col gap-4 [--radius:1rem]"><!></div>`);

export default function Spinner_item_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
		Item_Root($$anchor, {
			variant: 'outline',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Item.Media, ($$anchor, Item_Media) => {
					Item_Media($$anchor, {
						variant: 'icon',
						children: ($$anchor, $$slotProps) => {
							Spinner($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Item.Title, ($$anchor, Item_Title) => {
								Item_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Downloading...');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Item.Description, ($$anchor, Item_Description) => {
								Item_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('129 MB / 1000 MB');

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

				var node_5 = $.sibling(node_2, 2);

				$.component(node_5, () => Item.Actions, ($$anchor, Item_Actions) => {
					Item_Actions($$anchor, {
						class: 'hidden sm:flex',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Cancel');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => Item.Footer, ($$anchor, Item_Footer) => {
					Item_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Progress($$anchor, { value: 75 });
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}