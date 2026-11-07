import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Blocks from '@lucide/svelte/icons/blocks';
import Brain from '@lucide/svelte/icons/brain';
import LineChart from '@lucide/svelte/icons/chart-line';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Cpu from '@lucide/svelte/icons/cpu';
import Database from '@lucide/svelte/icons/database';
import Globe from '@lucide/svelte/icons/globe';
import Layout from '@lucide/svelte/icons/layout-template';
import Network from '@lucide/svelte/icons/network';
import Search from '@lucide/svelte/icons/search';
import Server from '@lucide/svelte/icons/server';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';

var root = $.from_html(`<span class="flex min-w-0 items-center gap-2"><!> <span class="truncate"> </span></span>`);
var root_1 = $.from_html(`<span class="text-muted-foreground">Select service category</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex items-center gap-2"><!> </div> <span class="text-muted-foreground text-xs"> </span>`, 1);
var root_4 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_45($$anchor) {
	let open = $.state(false);
	let value = $.state('');

	const items = [
		{
			icon: LineChart,
			label: 'Analytics Platform',
			number: 2451,
			value: 'analytics platform'
		},

		{
			icon: Brain,
			label: 'AI Services',
			number: 1832,
			value: 'ai services'
		},

		{
			icon: Database,
			label: 'Database Systems',
			number: 1654,
			value: 'database systems'
		},

		{
			icon: Cpu,
			label: 'Compute Resources',
			number: 943,
			value: 'compute resources'
		},

		{
			icon: Network,
			label: 'Network Services',
			number: 832,
			value: 'network services'
		},

		{
			icon: Globe,
			label: 'Web Services',
			number: 654,
			value: 'web services'
		},

		{
			icon: Search,
			label: 'Monitoring Tools',
			number: 432,
			value: 'monitoring tools'
		},

		{
			icon: Server,
			label: 'Server Management',
			number: 321,
			value: 'server management'
		},

		{
			icon: Blocks,
			label: 'Infrastructure',
			number: 234,
			value: 'infrastructure'
		},

		{
			icon: Layout,
			label: 'Frontend Services',
			number: 123,
			value: 'frontend services'
		}
	];

	const selectedItem = $.derived(() => items.find((item) => item.value === $.get(value)));

	function handleSelect(currentValue) {
		$.set(value, currentValue, true);
		$.set(open, false);
	}

	var div = root_4();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Options with icon and number');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_2 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(
							{
								variant: 'outline',
								role: 'combobox',
								get 'aria-expanded'() {
									return $.get(open);
								},
								class: 'bg-background hover:bg-background focus-visible:border-ring focus-visible:outline-ring/20 w-full justify-between px-3 font-normal outline-offset-0 focus-visible:outline-[3px]'
							},
							props,
							{
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_2();
									var node_3 = $.first_child(fragment_2);

									{
										var consequent = ($$anchor) => {
											const IconComponent = $.derived(() => $.get(selectedItem).icon);
											var span = root();
											var node_4 = $.child(span);

											$.component(node_4, () => $.get(IconComponent), ($$anchor, IconComponent_1) => {
												IconComponent_1($$anchor, { class: 'text-muted-foreground h-4 w-4' });
											});

											var span_1 = $.sibling(node_4, 2);
											var text_1 = $.only_child(span_1, true);

											$.reset(span);
											$.template_effect(() => $.set_text(text_1, $.get(selectedItem).label));
											$.append($$anchor, span);
										};

										var alternate = ($$anchor) => {
											var span_2 = root_1();

											$.append($$anchor, span_2);
										};

										$.if(node_3, ($$render) => {
											if ($.get(value) && $.get(selectedItem)) $$render(consequent); else $$render(alternate, -1);
										});
									}

									var node_5 = $.sibling(node_3, 2);

									ChevronDown(node_5, {
										size: 16,
										class: 'text-muted-foreground/80 shrink-0',
										'aria-hidden': 'true'
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							}
						));
					};

					$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_6 = $.sibling(node_2, 2);

				$.component(node_6, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-full min-w-(--bits-popover-anchor-width) p-0',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_7 = $.first_child(fragment_3);

							$.component(node_7, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_2();
										var node_8 = $.first_child(fragment_4);

										$.component(node_8, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search services...' });
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();
													var node_10 = $.first_child(fragment_5);

													$.component(node_10, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('No service found.');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_12 = $.first_child(fragment_6);

																$.each(node_12, 17, () => items, (item) => item.value, ($$anchor, item) => {
																	var fragment_7 = $.comment();
																	var node_13 = $.first_child(fragment_7);

																	$.component(node_13, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			get value() {
																				return $.get(item).value;
																			},
																			onSelect: () => handleSelect($.get(item).value),
																			children: ($$anchor, $$slotProps) => {
																				var fragment_8 = root_3();
																				var div_1 = $.first_child(fragment_8);
																				var node_14 = $.child(div_1);

																				$.component(node_14, () => $.get(item).icon, ($$anchor, item_icon) => {
																					item_icon($$anchor, { class: 'text-muted-foreground h-4 w-4' });
																				});

																				var text_3 = $.sibling(node_14);

																				$.reset(div_1);

																				var span_3 = $.sibling(div_1, 2);
																				var text_4 = $.only_child(span_3, true);

																				$.template_effect(
																					($0) => {
																						$.set_text(text_3, ` ${$.get(item).label ?? ''}`);
																						$.set_text(text_4, $0);
																					},
																					[() => $.get(item).number.toLocaleString()]
																				);

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
}