import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Popover from '$lib/components/ui/popover';
import Button from '$lib/components/button.svelte';
import * as Command from '$lib/components/ui/command';
import { ScrollArea } from '$lib/components/ui/scroll-area';
import CheckIcon from '@lucide/svelte/icons/check';
import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
import { cn } from '$lib/utils.js';
import Flag from './flag.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="flex-1 text-sm"> </span> <span class="text-foreground/50 text-sm"> </span> <div class="w-4"><!></div>`, 1);

export default function Country_selector($$anchor, $$props) {
	$.push($$props, true);

	/** List of countries */
	/** Default ordering is alphabetical by country name supply this function to customize the sorting behavior  */
	let disabled = $.prop($$props, 'disabled', 3, false),
		selected = $.prop($$props, 'selected', 15, null),
		onselect = $.prop($$props, 'onselect', 3, undefined),
		order = $.prop($$props, 'order', 3, (a, b) => {
			return a.name.localeCompare(b.name);
		});

	let selectedCountry = $.derived(() => $$props.countries.find((a) => a.iso2 == selected()));
	let open = $.state(false);
	let selectedValue = $.state(false);

	function selectCountry(country) {
		selected(country.iso2);
		$.set(selectedValue, true);
		$.set(open, false);
		onselect()?.(selected());
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
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						{
							let $0 = $.derived(() => cn('flex shrink-0 gap-1 rounded-l-lg rounded-r-none px-3'));

							Button($$anchor, $.spread_props(props, {
								type: 'button',
								variant: 'outline',
								get class() {
									return $.get($0);
								},

								get disabled() {
									return disabled();
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									Flag(node_2, {
										get country() {
											return $.get(selectedCountry);
										}
									});

									var node_3 = $.sibling(node_2, 2);

									{
										let $0 = $.derived(() => cn('-mr-2 h-4 w-4 opacity-50', disabled() ? 'hidden' : 'opacity-100'));

										ChevronsUpDownIcon(node_3, {
											get class() {
												return $.get($0);
											}
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							}));
						}
					};

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-[300px] p-0',
						align: 'start',
						onCloseAutoFocus: (e) => {
							if ($.get(selectedValue)) {
								$.set(selectedValue, false);
								e.preventDefault();
							}
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_6 = $.first_child(fragment_5);

										$.component(node_6, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search...' });
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													ScrollArea($$anchor, {
														class: 'h-72',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_8 = $.first_child(fragment_7);

															$.component(node_8, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('No country found.');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => Command.Group, ($$anchor, Command_Group) => {
																Command_Group($$anchor, {
																	class: 'overflow-clip',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = $.comment();
																		var node_10 = $.first_child(fragment_8);

																		$.each(node_10, 17, () => $$props.countries.sort(order()), (country) => country.id, ($$anchor, country) => {
																			var fragment_9 = $.comment();
																			var node_11 = $.first_child(fragment_9);

																			$.component(node_11, () => Command.Item, ($$anchor, Command_Item) => {
																				Command_Item($$anchor, {
																					class: 'gap-2 [&_.cn-command-item-indicator]:hidden',
																					get value() {
																						return $.get(country).name;
																					},
																					onSelect: () => selectCountry($.get(country)),
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = root_1();
																						var node_12 = $.first_child(fragment_10);

																						Flag(node_12, {
																							get country() {
																								return $.get(country);
																							}
																						});

																						var span = $.sibling(node_12, 2);
																						var text_1 = $.only_child(span, true);
																						var span_1 = $.sibling(span, 2);
																						var text_2 = $.only_child(span_1);
																						var div = $.sibling(span_1, 2);
																						var node_13 = $.child(div);

																						{
																							var consequent = ($$anchor) => {
																								CheckIcon($$anchor, { class: 'phone-input-check-icon size-4' });
																							};

																							$.if(node_13, ($$render) => {
																								if ($.get(country).iso2 == selected()) $$render(consequent);
																							});
																						}

																						$.reset(div);

																						$.template_effect(() => {
																							$.set_text(text_1, $.get(country).name);
																							$.set_text(text_2, `+${$.get(country).dialCode ?? ''}`);
																						});

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