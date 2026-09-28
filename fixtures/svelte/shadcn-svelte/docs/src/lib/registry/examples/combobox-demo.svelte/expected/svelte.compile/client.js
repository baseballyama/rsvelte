import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Combobox_demo($$anchor, $$props) {
	$.push($$props, true);

	const frameworks = [
		{ value: "sveltekit", label: "SvelteKit" },
		{ value: "next.js", label: "Next.js" },
		{ value: "nuxt.js", label: "Nuxt.js" },
		{ value: "remix", label: "Remix" },
		{ value: "astro", label: "Astro" }
	];

	let open = $.state(false);
	let value = $.state("");
	let triggerRef = $.state(null);
	const selectedValue = $.derived(() => frameworks.find((f) => f.value === $.get(value))?.label);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		$.set(open, false);

		tick().then(() => {
			$.get(triggerRef).focus();
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
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							class: 'w-[200px] justify-between',
							role: 'combobox',
							get 'aria-expanded'() {
								return $.get(open);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_3 = root();
								var text = $.first_child(fragment_3);
								var node_2 = $.sibling(text);

								ChevronsUpDownIcon(node_2, { class: 'opacity-50' });
								$.template_effect(() => $.set_text(text, `${($.get(selectedValue) || "Select a framework...") ?? ''} `));
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get ref() {
								return $.get(triggerRef);
							},

							set ref($$value) {
								$.set(triggerRef, $$value, true);
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-[200px] p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search framework...' });
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_2();
													var node_7 = $.first_child(fragment_6);

													$.component(node_7, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('No framework found.');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															value: 'frameworks',
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = $.comment();
																var node_9 = $.first_child(fragment_7);

																$.each(node_9, 17, () => frameworks, (framework) => framework.value, ($$anchor, framework) => {
																	var fragment_8 = $.comment();
																	var node_10 = $.first_child(fragment_8);

																	$.component(node_10, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			get value() {
																				return $.get(framework).value;
																			},

																			onSelect: () => {
																				$.set(value, $.get(framework).value, true);
																				closeAndFocusTrigger();
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = root_1();
																				var node_11 = $.first_child(fragment_9);

																				{
																					let $0 = $.derived(() => cn($.get(value) !== $.get(framework).value && "text-transparent"));

																					CheckIcon(node_11, {
																						get class() {
																							return $.get($0);
																						}
																					});
																				}

																				var text_2 = $.sibling(node_11);

																				$.template_effect(() => $.set_text(text_2, ` ${$.get(framework).label ?? ''}`));
																				$.append($$anchor, fragment_9);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_8);
																});

																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}