import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from "$app/navigation";
import { page } from "$app/state";
import * as Command from "$lib/registry/ui/command/index.js";
import { examples } from "$lib/registry/examples/create/index.js";
import { ActionMenuContext, ActionMenuCtx } from "./action-menu-context.svelte.js";
import { groupItemsByType } from "../lib/utils.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Action_menu($$anchor, $$props) {
	$.push($$props, true);

	const actionMenuCtx = ActionMenuCtx.set(new ActionMenuContext());
	const commandPaletteExamples = $.derived(() => examples.filter((example) => !example.hideFromCommandPalette));
	const groupedItems = $.derived(() => groupItemsByType($.get(commandPaletteExamples)));

	function handleKeydown(e) {
		if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			e.stopPropagation();
			actionMenuCtx.open = !actionMenuCtx.open;
		}
	}

	function handleSelect(itemName) {
		goto(`/create/${itemName}${page.url.search}`);
		actionMenuCtx.open = false;
	}

	var fragment = root();

	$.event('keydown', $.document, handleKeydown);

	var node = $.first_child(fragment);

	$.component(node, () => Command.Dialog, ($$anchor, Command_Dialog) => {
		Command_Dialog($$anchor, {
			get value() {
				return page.params.item;
			},
			class: 'animate-none!',
			get open() {
				return actionMenuCtx.open;
			},

			set open($$value) {
				actionMenuCtx.open = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, { placeholder: 'Search' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Command.Empty, ($$anchor, Command_Empty) => {
								Command_Empty($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('No items found.');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Command.Group, ($$anchor, Command_Group) => {
								Command_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										$.each(node_5, 17, () => $.get(groupedItems), (group) => group.type, ($$anchor, group) => {
											var fragment_4 = $.comment();
											var node_6 = $.first_child(fragment_4);

											$.each(node_6, 17, () => $.get(group).items, (item) => item.name, ($$anchor, item) => {
												var fragment_5 = $.comment();
												var node_7 = $.first_child(fragment_5);

												{
													let $0 = $.derived(() => page.params.item === $.get(item).name);

													$.component(node_7, () => Command.Item, ($$anchor, Command_Item) => {
														Command_Item($$anchor, {
															get value() {
																return $.get(item).name;
															},
															onSelect: () => handleSelect($.get(item).name),
															get 'data-checked'() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, $.get(item).title));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_5);
											});

											$.append($$anchor, fragment_4);
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

	var node_8 = $.sibling(node, 2);

	$.snippet(node_8, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}