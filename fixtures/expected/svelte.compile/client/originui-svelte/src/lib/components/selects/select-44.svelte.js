import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Check from '@lucide/svelte/icons/check';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';
import { cn } from '$lib/utils';

var root = $.from_html(`<span class="flex min-w-0 items-center gap-2"><span class="text-lg leading-none"> </span> <span class="truncate"> </span></span>`);
var root_1 = $.from_html(`<span class="text-muted-foreground">Select country</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<span class="text-lg leading-none"> </span> <!>`, 1);
var root_4 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_44($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let value = $.state('');

	const countries = [
		{
			continent: 'Europe',
			items: [
				{ flag: '🇩🇪', value: 'Germany' },
				{ flag: '🇬🇧', value: 'United Kingdom' },
				{ flag: '🇫🇷', value: 'France' }
			]
		},

		{
			continent: 'America',
			items: [
				{ flag: '🇺🇸', value: 'United States' },
				{ flag: '🇨🇦', value: 'Canada' },
				{ flag: '🇲🇽', value: 'Mexico' }
			]
		},

		{
			continent: 'Africa',
			items: [
				{ flag: '🇿🇦', value: 'South Africa' },
				{ flag: '🇳🇬', value: 'Nigeria' },
				{ flag: '🇲🇦', value: 'Morocco' }
			]
		},

		{
			continent: 'Asia',
			items: [
				{ flag: '🇨🇳', value: 'China' },
				{ flag: '🇯🇵', value: 'Japan' },
				{ flag: '🇮🇳', value: 'India' }
			]
		},

		{
			continent: 'Oceania',
			items: [
				{ flag: '🇦🇺', value: 'Australia' },
				{ flag: '🇳🇿', value: 'New Zealand' }
			]
		}
	];

	const selectedCountry = $.derived(() => {
		const items = countries.flatMap((group) => group.items);

		return items.find((item) => item.value === $.get(value));
	});

	function handleSelect(currentValue) {
		$.set(value, currentValue, true);
		$.set(open, false);
	}

	var div = root_4();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Options with flag and search');

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
											var span = root();
											var span_1 = $.child(span);
											var text_1 = $.only_child(span_1, true);
											var span_2 = $.sibling(span_1, 2);
											var text_2 = $.only_child(span_2, true);

											$.reset(span);

											$.template_effect(() => {
												$.set_text(text_1, $.get(selectedCountry).flag);
												$.set_text(text_2, $.get(value));
											});

											$.append($$anchor, span);
										};

										var alternate = ($$anchor) => {
											var span_3 = root_1();

											$.append($$anchor, span_3);
										};

										$.if(node_3, ($$render) => {
											if ($.get(value) && $.get(selectedCountry)) $$render(consequent); else $$render(alternate, -1);
										});
									}

									var node_4 = $.sibling(node_3, 2);

									ChevronDown(node_4, {
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

				var node_5 = $.sibling(node_2, 2);

				$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-full min-w-(--bits-popover-anchor-width) p-0',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_6 = $.first_child(fragment_3);

							$.component(node_6, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_2();
										var node_7 = $.first_child(fragment_4);

										$.component(node_7, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search country...' });
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();
													var node_9 = $.first_child(fragment_5);

													$.component(node_9, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('No country found.');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_9, 2);

													$.each(node_10, 17, () => countries, (group) => group.continent, ($$anchor, group) => {
														var fragment_6 = $.comment();
														var node_11 = $.first_child(fragment_6);

														$.component(node_11, () => Command.Group, ($$anchor, Command_Group) => {
															Command_Group($$anchor, {
																get heading() {
																	return $.get(group).continent;
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = $.comment();
																	var node_12 = $.first_child(fragment_7);

																	$.each(node_12, 17, () => $.get(group).items, (country) => country.value, ($$anchor, country) => {
																		var fragment_8 = $.comment();
																		var node_13 = $.first_child(fragment_8);

																		$.component(node_13, () => Command.Item, ($$anchor, Command_Item) => {
																			Command_Item($$anchor, {
																				get value() {
																					return $.get(country).value;
																				},
																				onSelect: () => handleSelect($.get(country).value),
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root_3();
																					var span_4 = $.first_child(fragment_9);
																					var text_4 = $.only_child(span_4, true);
																					var text_5 = $.sibling(span_4);
																					var node_14 = $.sibling(text_5);

																					{
																						let $0 = $.derived(() => cn('ml-auto', $.get(value) === $.get(country).value ? 'opacity-100' : 'opacity-0'));

																						Check(node_14, {
																							get class() {
																								return $.get($0);
																							}
																						});
																					}

																					$.template_effect(() => {
																						$.set_text(text_4, $.get(country).flag);
																						$.set_text(text_5, ` ${$.get(country).value ?? ''} `);
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