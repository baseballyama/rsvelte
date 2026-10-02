import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from '$lib/components/ui/dialog';
import * as Command from '$lib/components/ui/command';
import { goto } from '$app/navigation';
import { commandContext } from '$lib/context';
import { groupedDocs } from '$lib/features/docs/docs';

var root = $.from_html(`<!> <!>`, 1);

export default function Command_1($$anchor, $$props) {
	$.push($$props, true);

	const commandState = commandContext.get();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return commandState.current;
			},

			set open($$value) {
				commandState.current = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'top-[35%] p-0',
						showCloseButton: false,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search for extras...' });
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												class: 'min-h-[300px]',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('No results found.');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.each(node_6, 17, () => Object.entries(groupedDocs), ([group, routes]) => group, ($$anchor, $$item) => {
														var $$array = $.derived(() => $.to_array($.get($$item), 2));
														let group = () => $.get($$array)[0];
														let routes = () => $.get($$array)[1];
														var fragment_5 = $.comment();
														var node_7 = $.first_child(fragment_5);

														$.component(node_7, () => Command.Group, ($$anchor, Command_Group) => {
															Command_Group($$anchor, {
																get heading() {
																	return group();
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = $.comment();
																	var node_8 = $.first_child(fragment_6);

																	$.each(node_8, 17, routes, (route) => route.title, ($$anchor, route) => {
																		var fragment_7 = $.comment();
																		var node_9 = $.first_child(fragment_7);

																		$.component(node_9, () => Command.Item, ($$anchor, Command_Item) => {
																			Command_Item($$anchor, {
																				onclick: async () => {
																					await goto($.get(route).href);
																					commandState.setFalse();
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text();

																					$.template_effect(() => $.set_text(text_1, $.get(route).title));
																					$.append($$anchor, text_1);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_7);
																	});

																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_5);
													});

													$.append($$anchor, fragment_4);
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

	$.append($$anchor, fragment);
	$.pop();
}