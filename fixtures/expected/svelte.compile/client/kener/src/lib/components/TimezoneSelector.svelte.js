import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/components/ui/command/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { timezone, selectedTimezone } from "$lib/stores/timezone";
import Globe from "@lucide/svelte/icons/globe";
import CheckIcon from "@lucide/svelte/icons/check";
import { tick } from "svelte";
import { cn } from "$lib/utils.js";
import trackEvent from "$lib/beacon";

var root = $.from_html(`<span class="sr-only"> </span>`);
var root_1 = $.from_html(`<span class="truncate"> </span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> `, 1);

export default function TimezoneSelector($$anchor, $$props) {
	$.push($$props, true);

	const $selectedTimezone = () => $.store_get(selectedTimezone, '$selectedTimezone', $$stores);
	const $timezone = () => $.store_get(timezone, '$timezone', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let compact = $.prop($$props, 'compact', 3, false);
	let open = $.state(false);
	let triggerRef = $.state(null);

	// Handle timezone change
	function handleTimezoneSelect(tz) {
		if (tz && tz !== $selectedTimezone()) {
			timezone.setTimezone(tz);
			trackEvent("timezone_changed", { timezone: tz });
		}

		closeAndFocusTrigger();
	}

	// Refocus the trigger button when the user selects an item
	function closeAndFocusTrigger() {
		$.set(open, false);

		tick().then(() => {
			$.get(triggerRef)?.focus();
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

						{
							let $0 = $.derived(() => cn("ksel bg-background/80 dark:bg-background/70 border-foreground/10 rounded-full border text-xs font-medium shadow-none backdrop-blur-md", compact() ? "size-8 p-0" : "max-w-[10rem] sm:max-w-none"));

							Button($$anchor, $.spread_props(props, {
								variant: 'outline',
								size: 'sm',
								get class() {
									return $.get($0);
								},
								role: 'combobox',
								get 'aria-expanded'() {
									return $.get(open);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_2 = $.first_child(fragment_3);

									Globe(node_2, { class: 'text-inherit' });

									var node_3 = $.sibling(node_2, 2);

									{
										var consequent = ($$anchor) => {
											var span = root();
											var text = $.only_child(span, true);

											$.template_effect(() => $.set_text(text, $selectedTimezone()));
											$.append($$anchor, span);
										};

										var alternate = ($$anchor) => {
											var span_1 = root_1();
											var text_1 = $.only_child(span_1, true);

											$.template_effect(() => $.set_text(text_1, $selectedTimezone()));
											$.append($$anchor, span_1);
										};

										$.if(node_3, ($$render) => {
											if (compact()) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							}));
						}
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

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-[280px] p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();
										var node_6 = $.first_child(fragment_5);

										$.component(node_6, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search timezone...' });
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												class: 'max-h-60',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_2();
													var node_8 = $.first_child(fragment_6);

													$.component(node_8, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('No timezone found.');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = $.comment();
																var node_10 = $.first_child(fragment_7);

																$.each(node_10, 1, () => $timezone().availableTimezones, (tz) => tz, ($$anchor, tz) => {
																	var fragment_8 = $.comment();
																	var node_11 = $.first_child(fragment_8);

																	$.component(node_11, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			get value() {
																				return $.get(tz);
																			},
																			onSelect: () => handleTimezoneSelect($.get(tz)),
																			class: 'text-xs',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = root_3();
																				var node_12 = $.first_child(fragment_9);

																				{
																					let $0 = $.derived(() => cn("me-2 size-4", $selectedTimezone() !== $.get(tz) && "text-transparent"));

																					CheckIcon(node_12, {
																						get class() {
																							return $.get($0);
																						}
																					});
																				}

																				var text_3 = $.sibling(node_12);

																				$.template_effect(() => $.set_text(text_3, ` ${$.get(tz) ?? ''}`));
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
	$$cleanup();
}