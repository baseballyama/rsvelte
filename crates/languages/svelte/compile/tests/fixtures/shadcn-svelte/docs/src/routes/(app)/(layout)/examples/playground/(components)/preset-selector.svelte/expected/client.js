import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import { useId } from "bits-ui";
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Preset_selector($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let value = $.state("");
	const selectedValue = $.derived(() => $$props.presets.find((f) => f.name === $.get(value))?.name ?? "Load a preset...");
	let triggerId = useId();

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId) {
		$.set(open, false);

		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	var fragment = $.comment();
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
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({
						variant: "outline",
						class: "flex-1 justify-between md:max-w-[200px] lg:max-w-[300px]"
					}));

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},
							role: 'combobox',
							get 'aria-expanded'() {
								return $.get(open);
							},

							get id() {
								return triggerId;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_2 = root();
								var text = $.first_child(fragment_2);
								var node_2 = $.sibling(text);

								ChevronsUpDownIcon(node_2, { class: 'opacity-50' });
								$.template_effect(() => $.set_text(text, `${$.get(selectedValue) ?? ''} `));
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-full p-0 md:w-[200px] lg:w-[300px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search presets...' });
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('No presets found.');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															heading: 'Examples',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_9 = $.first_child(fragment_6);

																$.each(node_9, 16, () => $$props.presets, (preset) => preset, ($$anchor, preset) => {
																	var fragment_7 = $.comment();
																	var node_10 = $.first_child(fragment_7);

																	$.component(node_10, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			get value() {
																				return preset.name;
																			},
																			class: 'aria-selected:bg-primary aria-selected:text-primary-foreground',
																			onSelect: () => {
																				$.set(value, preset.name, true);
																				closeAndFocusTrigger(triggerId);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var fragment_8 = root();
																				var text_2 = $.first_child(fragment_8);
																				var node_11 = $.sibling(text_2);

																				{
																					let $0 = $.derived(() => cn($.get(value) === preset.name ? "opacity-100" : "opacity-0"));

																					CheckIcon(node_11, {
																						get class() {
																							return $.get($0);
																						}
																					});
																				}

																				$.template_effect(() => $.set_text(text_2, `${preset.name ?? ''} `));
																				$.append($$anchor, fragment_8);
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
												},
												$$slots: { default: true }
											});
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}