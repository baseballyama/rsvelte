import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/registry/ui/command/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Command_basic($$anchor) {
	let open = $.state(false);

	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			Button(node, {
				onclick: () => $.set(open, true),
				variant: 'outline',
				class: 'w-fit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open Menu');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Command.Dialog, ($$anchor, Command_Dialog) => {
				Command_Dialog($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Command.Input, ($$anchor, Command_Input) => {
							Command_Input($$anchor, { placeholder: 'Type a command or search...' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Command.List, ($$anchor, Command_List) => {
							Command_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Command.Empty, ($$anchor, Command_Empty) => {
										Command_Empty($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('No results found.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Command.Group, ($$anchor, Command_Group) => {
										Command_Group($$anchor, {
											heading: 'Suggestions',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root();
												var node_6 = $.first_child(fragment_3);

												$.component(node_6, () => Command.Item, ($$anchor, Command_Item) => {
													Command_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Calendar');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => Command.Item, ($$anchor, Command_Item_1) => {
													Command_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Search Emoji');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Command.Item, ($$anchor, Command_Item_2) => {
													Command_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Calculator');

															$.append($$anchor, text_4);
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
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}