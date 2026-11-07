import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from "svelte";
import { toast } from "svelte-sonner";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="relative"><input type="hidden" name="framework"/> <!></div>`, 1);
var root_4 = $.from_html(`<form id="form-with-combobox" class="w-full"><!></form>`);

export default function Combobox_with_form($$anchor, $$props) {
	$.push($$props, true);

	const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
	let open = $.state(false);
	let value = $.state("");
	let triggerRef = $.state(null);
	const selectedValue = $.derived(() => $.get(value) || null);

	function closeAndFocusTrigger() {
		$.set(open, false);

		tick().then(() => {
			$.get(triggerRef)?.focus();
		});
	}

	function handleSubmit(e) {
		e.preventDefault();

		const formData = new FormData(e.target);
		const framework = formData.get("framework");

		toast(`You selected ${framework} as your framework.`);
	}

	Example($$anchor, {
		title: 'Form with Combobox',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full max-w-sm',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var form = root_4();
									var node_2 = $.child(form);

									$.component(node_2, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_3 = $.first_child(fragment_3);

												$.component(node_3, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root_3();
															var node_4 = $.first_child(fragment_4);

															$.component(node_4, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'framework',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Framework');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var div = $.sibling(node_4, 2);
															var input = $.child(div);

															$.remove_input_defaults(input);

															var node_5 = $.sibling(input, 2);

															$.component(node_5, () => Popover.Root, ($$anchor, Popover_Root) => {
																Popover_Root($$anchor, {
																	get open() {
																		return $.get(open);
																	},

																	set open($$value) {
																		$.set(open, $$value, true);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_5 = root_2();
																		var node_6 = $.first_child(fragment_5);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;

																				Button($$anchor, $.spread_props(props, {
																					variant: 'outline',
																					class: 'w-full justify-between font-normal',
																					role: 'combobox',
																					get 'aria-expanded'() {
																						return $.get(open);
																					},
																					type: 'button',
																					'aria-describedby': undefined,
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var fragment_7 = root();
																						var text_1 = $.first_child(fragment_7);
																						var node_7 = $.sibling(text_1);

																						IconPlaceholder(node_7, {
																							lucide: 'ChevronDownIcon',
																							tabler: 'IconChevronDown',
																							hugeicons: 'ArrowDown01Icon',
																							phosphor: 'CaretDownIcon',
																							remixicon: 'RiArrowDownSLine',
																							class: 'size-4 text-muted-foreground opacity-50'
																						});

																						$.template_effect(() => $.set_text(text_1, `${$.get(selectedValue) ?? "Select a framework" ?? ''} `));
																						$.append($$anchor, fragment_7);
																					},
																					$$slots: { default: true }
																				}));
																			};

																			$.component(node_6, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
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

																		var node_8 = $.sibling(node_6, 2);

																		$.component(node_8, () => Popover.Content, ($$anchor, Popover_Content) => {
																			Popover_Content($$anchor, {
																				class: 'w-[200px] p-0',
																				align: 'start',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = $.comment();
																					var node_9 = $.first_child(fragment_8);

																					$.component(node_9, () => Command.Root, ($$anchor, Command_Root) => {
																						Command_Root($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_9 = root_2();
																								var node_10 = $.first_child(fragment_9);

																								$.component(node_10, () => Command.Input, ($$anchor, Command_Input) => {
																									Command_Input($$anchor, { placeholder: 'Search framework...' });
																								});

																								var node_11 = $.sibling(node_10, 2);

																								$.component(node_11, () => Command.List, ($$anchor, Command_List) => {
																									Command_List($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_10 = root_2();
																											var node_12 = $.first_child(fragment_10);

																											$.component(node_12, () => Command.Empty, ($$anchor, Command_Empty) => {
																												Command_Empty($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_2 = $.text('No items found.');

																														$.append($$anchor, text_2);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_13 = $.sibling(node_12, 2);

																											$.component(node_13, () => Command.Group, ($$anchor, Command_Group) => {
																												Command_Group($$anchor, {
																													value: 'frameworks',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_11 = $.comment();
																														var node_14 = $.first_child(fragment_11);

																														$.each(node_14, 16, () => frameworks, (framework) => framework, ($$anchor, framework) => {
																															var fragment_12 = $.comment();
																															var node_15 = $.first_child(fragment_12);

																															$.component(node_15, () => Command.Item, ($$anchor, Command_Item) => {
																																Command_Item($$anchor, {
																																	get value() {
																																		return framework;
																																	},

																																	onSelect: () => {
																																		$.set(value, framework, true);
																																		closeAndFocusTrigger();
																																	},

																																	children: ($$anchor, $$slotProps) => {
																																		var fragment_13 = root_1();
																																		var node_16 = $.first_child(fragment_13);

																																		{
																																			let $0 = $.derived(() => cn($.get(value) !== framework && "text-transparent"));

																																			IconPlaceholder(node_16, {
																																				lucide: 'CheckIcon',
																																				tabler: 'IconCheck',
																																				hugeicons: 'Tick02Icon',
																																				phosphor: 'CheckIcon',
																																				remixicon: 'RiCheckLine',
																																				get class() {
																																					return $.get($0);
																																				}
																																			});
																																		}

																																		var text_3 = $.sibling(node_16);

																																		$.template_effect(() => $.set_text(text_3, ` ${framework ?? ''}`));
																																		$.append($$anchor, fragment_13);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															$.append($$anchor, fragment_12);
																														});

																														$.append($$anchor, fragment_11);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_10);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_9);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_5);
																	},
																	$$slots: { default: true }
																});
															});

															$.reset(div);
															$.template_effect(() => $.set_value(input, $.get(value)));
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

									$.reset(form);
									$.event('submit', form, handleSubmit);
									$.append($$anchor, form);
								},
								$$slots: { default: true }
							});
						});

						var node_17 = $.sibling(node_1, 2);

						$.component(node_17, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										type: 'submit',
										form: 'form-with-combobox',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Submit');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
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

	$.pop();
}