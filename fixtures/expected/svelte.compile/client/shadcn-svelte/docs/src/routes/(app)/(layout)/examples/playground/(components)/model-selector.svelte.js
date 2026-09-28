import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import { useId } from "bits-ui";
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import ModelItem from "./model-item.svelte";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<div class="mt-4 grid gap-2"><h5 class="text-sm leading-none font-medium">Strengths</h5> <ul class="text-sm text-muted-foreground"> </ul></div>`);
var root_4 = $.from_html(`<div class="grid gap-2"><h4 class="leading-none font-medium"> </h4> <div class="text-sm text-muted-foreground"> </div> <!></div>`);
var root_5 = $.from_html(`<div class="grid gap-2"><!> <!></div>`);

export default function Model_selector($$anchor, $$props) {
	$.push($$props, true);

	let selectedModel = $.derived(() => $$props.models[0]);
	let peekedModel = $.state(void 0);
	let open = $.state(false);
	let value = $.state("");
	const selectedValue = $.derived(() => $$props.models.find((f) => f.id === $.get(value))?.name ?? "Select a model...");

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId) {
		$.set(open, false);

		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	function onPopoverOpenChange(open) {
		if (open) {
			$.set(peekedModel, $.get(selectedModel), true);
		} else {
			$.set(peekedModel, undefined);
		}
	}

	const hoverCardIsOpen = $.derived(() => $.get(open) && $.get(peekedModel) !== undefined);
	let triggerId = useId();

	function handlePeek(model) {
		if ($.get(peekedModel) === undefined) {
			if (!$.get(open)) return;

			$.set(peekedModel, model, true);

			return;
		}

		$.set(peekedModel, model, true);
	}

	function onPopoverOutsideClick() {
		$.set(peekedModel, undefined);
	}

	var div = root_5();
	var node = $.child(div);

	$.component(node, () => HoverCard.Root, ($$anchor, HoverCard_Root) => {
		HoverCard_Root($$anchor, {
			openDelay: 200,
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var div_1 = root();

						$.attribute_effect(div_1, () => ({ ...props() }));

						var node_2 = $.child(div_1);

						Label(node_2, {
							for: 'model',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Model');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					};

					$.component(node_1, () => HoverCard.Trigger, ($$anchor, HoverCard_Trigger) => {
						HoverCard_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => HoverCard.Content, ($$anchor, HoverCard_Content) => {
					HoverCard_Content($$anchor, {
						class: 'w-[260px] text-sm',
						align: 'start',
						side: 'left',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('The model which will generate the completion. Some models are suitable for natural language\n			tasks, others specialize in code. Learn more.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node, 2);

	$.component(node_4, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			onOpenChange: onPopoverOpenChange,
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_5 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "outline", class: "w-[200px] justify-between" }));

					$.component(node_5, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
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

								var fragment_2 = root_2();
								var text_2 = $.first_child(fragment_2);
								var node_6 = $.sibling(text_2);

								ChevronsUpDownIcon(node_6, { class: 'opacity-50' });
								$.template_effect(() => $.set_text(text_2, `${$.get(selectedValue) ?? ''} `));
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_7 = $.sibling(node_5, 2);

				$.component(node_7, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-[250px] p-0',
						onInteractOutside: onPopoverOutsideClick,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_8 = $.first_child(fragment_3);

							$.component(node_8, () => HoverCard.Root, ($$anchor, HoverCard_Root_1) => {
								HoverCard_Root_1($$anchor, {
									get open() {
										return $.get(hoverCardIsOpen);
									},
									openDelay: 0,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_9 = $.first_child(fragment_4);

										$.component(node_9, () => HoverCard.Content, ($$anchor, HoverCard_Content_1) => {
											HoverCard_Content_1($$anchor, {
												interactOutsideBehavior: 'ignore',
												class: '-ms-2 min-h-[280px]',
												side: 'left',
												align: 'start',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_10 = $.first_child(fragment_5);

													{
														var consequent_1 = ($$anchor) => {
															var div_2 = root_4();
															var h4 = $.child(div_2);
															var text_3 = $.only_child(h4, true);
															var div_3 = $.sibling(h4, 2);
															var text_4 = $.only_child(div_3, true);
															var node_11 = $.sibling(div_3, 2);

															{
																var consequent = ($$anchor) => {
																	var div_4 = root_3();
																	var ul = $.sibling($.child(div_4), 2);
																	var text_5 = $.only_child(ul, true);

																	$.reset(div_4);
																	$.template_effect(() => $.set_text(text_5, $.get(peekedModel).strengths));
																	$.append($$anchor, div_4);
																};

																$.if(node_11, ($$render) => {
																	if ($.get(peekedModel).strengths) $$render(consequent);
																});
															}

															$.reset(div_2);

															$.template_effect(() => {
																$.set_text(text_3, $.get(peekedModel).name);
																$.set_text(text_4, $.get(peekedModel).description);
															});

															$.append($$anchor, div_2);
														};

														$.if(node_10, ($$render) => {
															if ($.get(peekedModel) && $.get(hoverCardIsOpen)) $$render(consequent_1);
														});
													}

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_9, 2);

										$.component(node_12, () => Command.Root, ($$anchor, Command_Root) => {
											Command_Root($$anchor, {
												loop: true,
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var node_13 = $.first_child(fragment_6);

													$.component(node_13, () => Command.Input, ($$anchor, Command_Input) => {
														Command_Input($$anchor, { placeholder: 'Search Models....' });
													});

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => Command.List, ($$anchor, Command_List) => {
														Command_List($$anchor, {
															class: 'h-(--bits-command-list-height) max-h-[400px]',
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_1();
																var node_15 = $.first_child(fragment_7);

																$.component(node_15, () => Command.Empty, ($$anchor, Command_Empty) => {
																	Command_Empty($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('No models found.');

																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_16 = $.sibling(node_15, 2);

																$.each(node_16, 16, () => $$props.types, (type) => type, ($$anchor, type) => {
																	var fragment_8 = $.comment();
																	var node_17 = $.first_child(fragment_8);

																	$.component(node_17, () => Command.Group, ($$anchor, Command_Group) => {
																		Command_Group($$anchor, {
																			get heading() {
																				return type;
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = $.comment();
																				var node_18 = $.first_child(fragment_9);

																				$.each(node_18, 17, () => $$props.models.filter((model) => model.type === type), (model) => model.id, ($$anchor, model) => {
																					var fragment_10 = $.comment();
																					var node_19 = $.first_child(fragment_10);

																					{
																						const child = ($$anchor, $$arg0) => {
																							let props = () => ($$arg0?.()).props;
																							var div_5 = root();

																							$.attribute_effect(div_5, () => ({ ...props(), role: 'button', tabindex: 0 }));

																							var node_20 = $.child(div_5);

																							{
																								let $0 = $.derived(() => $.get(value) === $.get(model).id);

																								ModelItem(node_20, {
																									get model() {
																										return $.get(model);
																									},

																									onSelect: () => {
																										$.set(value, $.get(model).id, true);
																										closeAndFocusTrigger(triggerId);
																									},

																									onPeek: () => {
																										handlePeek($.get(model));
																									},

																									get isSelected() {
																										return $.get($0);
																									}
																								});
																							}

																							$.reset(div_5);
																							$.append($$anchor, div_5);
																						};

																						$.component(node_19, () => HoverCard.Trigger, ($$anchor, HoverCard_Trigger_1) => {
																							HoverCard_Trigger_1($$anchor, { child, $$slots: { child: true } });
																						});
																					}

																					$.append($$anchor, fragment_10);
																				});

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

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}