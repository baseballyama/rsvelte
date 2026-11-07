import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command, Popover } from "bits-ui";
import SubItem from "./sub-item.svelte";
import { FinderIcon, StarIcon, WindowIcon } from "./icons/index.js";

var root = $.from_html(`<button>Actions <kbd>⌘</kbd> <kbd>K</kbd></button>`);
var root_1 = $.from_html(`<!> Open Application`, 1);
var root_2 = $.from_html(`<!> Show in Finder`, 1);
var root_3 = $.from_html(`<!> Show Info in Finder`, 1);
var root_4 = $.from_html(`<!> Add to Favorites`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function Sub_command($$anchor, $$props) {
	$.push($$props, true);

	let listEl = $.prop($$props, 'listEl', 7);
	let open = $.state(false);

	function handleKeydown(e) {
		if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			$.set(open, true);
		}
	}

	$.user_effect(() => {
		if (!listEl()) return;

		if ($.get(open)) {
			listEl().style.overflow = "hidden";
		} else {
			listEl().style.overflow = "";
		}
	});

	var fragment = $.comment();

	$.event('keydown', $.document, handleKeydown);

	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_6();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var button = root();

						$.attribute_effect(button, () => ({
							...props(),
							'data-command-raycast-subcommand-trigger': '',
							'aria-expanded': $.get(open)
						}));

						$.append($$anchor, button);
					};

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									onCloseAutoFocus: (e) => {
										e.preventDefault();
										$$props.inputEl?.focus();
									},
									preventScroll: true,
									class: 'raycast-submenu',
									side: 'top',
									align: 'end',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Command.Root, ($$anchor, Command_Root) => {
											Command_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_6();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Command.List, ($$anchor, Command_List) => {
														Command_List($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_6 = $.first_child(fragment_5);

																$.component(node_6, () => Command.Group, ($$anchor, Command_Group) => {
																	Command_Group($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root_5();
																			var node_7 = $.first_child(fragment_6);

																			$.component(node_7, () => Command.GroupHeading, ($$anchor, Command_GroupHeading) => {
																				Command_GroupHeading($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text = $.text();

																						$.template_effect(() => $.set_text(text, $$props.selectedValue));
																						$.append($$anchor, text);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_8 = $.sibling(node_7, 2);

																			SubItem(node_8, {
																				shortcut: '↵',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = root_1();
																					var node_9 = $.first_child(fragment_8);

																					WindowIcon(node_9, {});
																					$.next();
																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});

																			var node_10 = $.sibling(node_8, 2);

																			SubItem(node_10, {
																				shortcut: '⌘ ↵',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root_2();
																					var node_11 = $.first_child(fragment_9);

																					FinderIcon(node_11, {});
																					$.next();
																					$.append($$anchor, fragment_9);
																				},
																				$$slots: { default: true }
																			});

																			var node_12 = $.sibling(node_10, 2);

																			SubItem(node_12, {
																				shortcut: '⌘ I',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root_3();
																					var node_13 = $.first_child(fragment_10);

																					FinderIcon(node_13, {});
																					$.next();
																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			});

																			var node_14 = $.sibling(node_12, 2);

																			SubItem(node_14, {
																				shortcut: '⌘ ⇧ F',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_4();
																					var node_15 = $.first_child(fragment_11);

																					StarIcon(node_15, {});
																					$.next();
																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});

																			$.append($$anchor, fragment_6);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_5, 2);

													$.component(node_16, () => Command.Input, ($$anchor, Command_Input) => {
														Command_Input($$anchor, { placeholder: 'Search for actions...' });
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