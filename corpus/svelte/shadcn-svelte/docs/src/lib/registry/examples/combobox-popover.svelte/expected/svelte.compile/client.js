import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleIcon from "@lucide/svelte/icons/circle";
import CircleArrowUpIcon from "@lucide/svelte/icons/circle-arrow-up";
import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
import CircleXIcon from "@lucide/svelte/icons/circle-x";
import { useId } from "bits-ui";
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex items-center space-x-4"><p class="text-sm text-muted-foreground">Status</p> <!></div>`);

export default function Combobox_popover($$anchor, $$props) {
	$.push($$props, true);

	const statuses = [
		{ value: "backlog", label: "Backlog", icon: CircleHelpIcon },
		{ value: "todo", label: "Todo", icon: CircleIcon },
		{
			value: "in progress",
			label: "In Progress",
			icon: CircleArrowUpIcon
		},
		{ value: "done", label: "Done", icon: CircleCheckIcon },
		{ value: "canceled", label: "Canceled", icon: CircleXIcon }
	];

	let open = $.state(false);
	let value = $.state("");
	const selectedStatus = $.derived(() => statuses.find((s) => s.value === $.get(value)));

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId) {
		$.set(open, false);

		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	const triggerId = useId();
	var div = root_3();
	var node = $.sibling($.child(div), 2);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				{
					let $0 = $.derived(() => buttonVariants({
						variant: "outline",
						size: "sm",
						class: "w-[150px] justify-start"
					}));

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get id() {
								return triggerId;
							},

							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_1 = $.comment();
								var node_2 = $.first_child(fragment_1);

								{
									var consequent = ($$anchor) => {
										const Icon = $.derived(() => $.get(selectedStatus).icon);
										var fragment_2 = root();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => $.get(Icon), ($$anchor, Icon_1) => {
											Icon_1($$anchor, { class: 'me-2 size-4 shrink-0' });
										});

										var text = $.sibling(node_3);

										$.template_effect(() => $.set_text(text, ` ${$.get(selectedStatus).label ?? ''}`));
										$.append($$anchor, fragment_2);
									};

									var alternate = ($$anchor) => {
										var text_1 = $.text('+ Set status');

										$.append($$anchor, text_1);
									};

									$.if(node_2, ($$render) => {
										if ($.get(selectedStatus)) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_1);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-[200px] p-0',
						side: 'right',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_2();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Change status...' });
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();
													var node_8 = $.first_child(fragment_5);

													$.component(node_8, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('No results found.');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_10 = $.first_child(fragment_6);

																$.each(node_10, 17, () => statuses, (status) => status.value, ($$anchor, status) => {
																	var fragment_7 = $.comment();
																	var node_11 = $.first_child(fragment_7);

																	$.component(node_11, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			get value() {
																				return $.get(status).value;
																			},

																			onSelect: () => {
																				$.set(value, $.get(status).value, true);
																				closeAndFocusTrigger(triggerId);
																			},

																			children: ($$anchor, $$slotProps) => {
																				const Icon = $.derived(() => $.get(status).icon);
																				var fragment_8 = root_1();
																				var node_12 = $.first_child(fragment_8);

																				{
																					let $0 = $.derived(() => cn("me-2 size-4", $.get(status).value !== $.get(selectedStatus)?.value && "text-foreground/40"));

																					$.component(node_12, () => $.get(Icon), ($$anchor, Icon_2) => {
																						Icon_2($$anchor, {
																							get class() {
																								return $.get($0);
																							}
																						});
																					});
																				}

																				var span = $.sibling(node_12, 2);
																				var text_3 = $.only_child(span, true);

																				$.template_effect(() => $.set_text(text_3, $.get(status).label));
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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}