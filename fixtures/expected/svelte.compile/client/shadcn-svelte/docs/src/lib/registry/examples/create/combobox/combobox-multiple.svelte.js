import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<div><!> <span class="flex-1 py-1 text-sm text-muted-foreground">Select frameworks...</span></div>`);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Combobox_multiple($$anchor, $$props) {
	$.push($$props, true);

	const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
	let open = $.state(false);
	let values = $.state($.proxy([frameworks[0]]));

	function toggleValue(framework) {
		$.set(
			values,
			$.get(values).includes(framework)
				? $.get(values).filter((v) => v !== framework)
				: [...$.get(values), framework],
			true
		);
	}

	function removeValue(e, framework) {
		e.stopPropagation();
		$.set(values, $.get(values).filter((v) => v !== framework), true);
	}

	Example($$anchor, {
		title: 'Combobox Multiple',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var div = root_1();

								$.attribute_effect(div, () => ({
									...props(),
									role: 'combobox',
									'aria-expanded': $.get(open),
									class: 'flex min-h-9 w-64 cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm shadow-xs transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
								}));

								var node_2 = $.child(div);

								$.each(node_2, 16, () => $.get(values), (framework) => framework, ($$anchor, framework) => {
									Badge($$anchor, {
										variant: 'secondary',
										class: 'gap-1 pr-0.5',
										onclick: (e) => removeValue(e, framework),
										onkeydown: (e) => e.key === "Enter" && removeValue(e, framework),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_4 = root();
											var text = $.first_child(fragment_4);
											var node_3 = $.sibling(text);

											IconPlaceholder(node_3, {
												lucide: 'XIcon',
												tabler: 'IconX',
												hugeicons: 'Cancel01Icon',
												phosphor: 'XIcon',
												remixicon: 'RiCloseLine',
												class: 'size-3'
											});

											$.template_effect(() => $.set_text(text, `${framework ?? ''} `));
											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.next(2);
								$.reset(div);
								$.append($$anchor, div);
							};

							$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
								Popover_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'w-64 p-0',
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_5 = $.first_child(fragment_5);

									$.component(node_5, () => Command.Root, ($$anchor, Command_Root) => {
										Command_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_3();
												var node_6 = $.first_child(fragment_6);

												$.component(node_6, () => Command.Input, ($$anchor, Command_Input) => {
													Command_Input($$anchor, { placeholder: 'Search framework...' });
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => Command.List, ($$anchor, Command_List) => {
													Command_List($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_3();
															var node_8 = $.first_child(fragment_7);

															$.component(node_8, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('No items found.');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => Command.Group, ($$anchor, Command_Group) => {
																Command_Group($$anchor, {
																	value: 'frameworks',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = $.comment();
																		var node_10 = $.first_child(fragment_8);

																		$.each(node_10, 16, () => frameworks, (framework) => framework, ($$anchor, framework) => {
																			var fragment_9 = $.comment();
																			var node_11 = $.first_child(fragment_9);

																			$.component(node_11, () => Command.Item, ($$anchor, Command_Item) => {
																				Command_Item($$anchor, {
																					get value() {
																						return framework;
																					},
																					onSelect: () => toggleValue(framework),
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = root_2();
																						var node_12 = $.first_child(fragment_10);

																						{
																							let $0 = $.derived(() => cn(!$.get(values).includes(framework) && "text-transparent"));

																							IconPlaceholder(node_12, {
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

																						var text_2 = $.sibling(node_12);

																						$.template_effect(() => $.set_text(text_2, ` ${framework ?? ''}`));
																						$.append($$anchor, fragment_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_9);
																		});

																		$.append($$anchor, fragment_8);
																	},
																	$$slots: { default: true }
																});
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