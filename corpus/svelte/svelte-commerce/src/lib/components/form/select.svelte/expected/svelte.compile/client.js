import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Check, ChevronsUpDown } from '@lucide/svelte';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';
import { Button } from '$lib/components/ui/button';
import { cn } from '$lib/core/utils';
import Label from '../ui/label/label.svelte';
import { Search } from '@lucide/svelte';
import Input from '../ui/input/input.svelte';
import { FormSelectRenderer } from '$lib/core/composables/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'error',
	'optional',
	'info',
	'class',
	'showSearch',
	'success',
	'optionSelected',
	'data',
	'id',
	'title',
	'errors',
	'value',
	'label',
	'valueField'
]);

var root = $.from_html(`<span class="text-xs text-muted-foreground">(Optional)</span>`);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<span class="min-w-0 truncate"> </span> <!>`, 1);
var root_3 = $.from_html(`<div class="flex items-center px-3"><!> <!></div>`);
var root_4 = $.from_html(`<!> `, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<span class="text-red-500"> </span>`);
var root_7 = $.from_html(`<div><!> <div><!></div></div> <!>`, 1);

export default function Select($$anchor, $$props) {
	$.push($$props, true);

	let error = $.prop($$props, 'error', 3, ''),
		optional = $.prop($$props, 'optional', 3, false),
		info = $.prop($$props, 'info', 3, ''),
		klass = $.prop($$props, 'class', 3, ''),
		showSearch = $.prop($$props, 'showSearch', 3, false),
		success = $.prop($$props, 'success', 3, false),
		optionSelected = $.prop($$props, 'optionSelected', 3, (value) => {}),
		id = $.prop($$props, 'id', 3, ''),
		title = $.prop($$props, 'title', 3, ''),
		errors = $.prop($$props, 'errors', 19, () => ({})),
		value = $.prop($$props, 'value', 7, ''),
		label = $.prop($$props, 'label', 3, ''),
		valueField = $.prop($$props, 'valueField', 3, 'value'),
		rest = $.rest_props($$props, rest_excludes);

	let triggerRef = $.state(null);
	let open = $.state(false);
	let searchQuery = $.state('');

	{
		const content = ($$anchor, $$arg0) => {
			let filteredData = () => ($$arg0?.()).filteredData;
			let selectedValue = () => ($$arg0?.()).selectedValue;
			let closeAndFocusTrigger = () => ($$arg0?.()).closeAndFocusTrigger;
			var fragment_1 = root_7();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			{
				var consequent_1 = ($$anchor) => {
					Label($$anchor, {
						class: 'block text-sm font-medium text-gray-700',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root_1();
							var text = $.first_child(fragment_3);
							var node_1 = $.sibling(text);

							{
								var consequent = ($$anchor) => {
									var span = root();

									$.append($$anchor, span);
								};

								$.if(node_1, ($$render) => {
									if (optional()) $$render(consequent);
								});
							}

							$.template_effect(() => $.set_text(text, `${label() ?? ''} `));
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				$.if(node, ($$render) => {
					if (label()) $$render(consequent_1);
				});
			}

			var div_1 = $.sibling(node, 2);

			$.attribute_effect(div_1, () => ({ class: 'relative w-full', ...rest }));

			var node_2 = $.child(div_1);

			$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_5();
						var node_3 = $.first_child(fragment_4);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(
									{
										'aria-label': 'Open Select Options',
										variant: 'outline',
										class: 'w-full justify-between font-normal'
									},
									props,
									{
										role: 'combobox',
										get 'aria-expanded'() {
											return $.get(open);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root_2();
											var span_1 = $.first_child(fragment_6);
											var text_1 = $.only_child(span_1, true);
											var node_4 = $.sibling(span_1, 2);

											ChevronsUpDown(node_4, { class: 'ml-2 size-4 shrink-0 opacity-50' });
											$.template_effect(() => $.set_text(text_1, selectedValue() || 'Select...'));
											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									}
								));
							};

							$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
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

						var node_5 = $.sibling(node_3, 2);

						$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'relative z-[1000000000] p-0',
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_6 = $.first_child(fragment_7);

									$.component(node_6, () => Command.Root, ($$anchor, Command_Root) => {
										Command_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_5();
												var node_7 = $.first_child(fragment_8);

												{
													var consequent_2 = ($$anchor) => {
														var div_2 = root_3();
														var node_8 = $.child(div_2);

														Search(node_8, { class: 'mr-2 size-4 shrink-0 opacity-50' });

														var node_9 = $.sibling(node_8, 2);

														{
															let $0 = $.derived(() => cn('flex h-10 w-full rounded-md border-none bg-transparent py-3 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50'));

															Input(node_9, {
																placeholder: 'Search...',
																get class() {
																	return $.get($0);
																},

																get value() {
																	return $.get(searchQuery);
																},

																set value($$value) {
																	$.set(searchQuery, $$value, true);
																}
															});
														}

														$.reset(div_2);
														$.append($$anchor, div_2);
													};

													$.if(node_7, ($$render) => {
														if (showSearch()) $$render(consequent_2);
													});
												}

												var node_10 = $.sibling(node_7, 2);

												$.component(node_10, () => Command.List, ($$anchor, Command_List) => {
													Command_List($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_5();
															var node_11 = $.first_child(fragment_9);

															$.component(node_11, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Not found.');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_11, 2);

															$.component(node_12, () => Command.Group, ($$anchor, Command_Group) => {
																Command_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_13 = $.first_child(fragment_10);

																		$.each(node_13, 17, filteredData, $.index, ($$anchor, d) => {
																			var fragment_11 = $.comment();
																			var node_14 = $.first_child(fragment_11);

																			$.component(node_14, () => Command.Item, ($$anchor, Command_Item) => {
																				Command_Item($$anchor, {
																					get value() {
																						return $.get(d)[valueField()];
																					},
																					class: 'aria-selected:bg-primary aria-selected:text-primary-foreground',
																					onSelect: () => {
																						optionSelected()($.get(d)[valueField()]);
																						value($.get(d)[valueField()]);
																						closeAndFocusTrigger()();
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_12 = root_4();
																						var node_15 = $.first_child(fragment_12);

																						{
																							let $0 = $.derived(() => cn('mr-2 size-4', value() !== $.get(d)[valueField()] && 'text-transparent'));

																							Check(node_15, {
																								get class() {
																									return $.get($0);
																								}
																							});
																						}

																						var text_3 = $.sibling(node_15);

																						$.template_effect(() => $.set_text(text_3, ` ${$.get(d).name ?? ''}`));
																						$.append($$anchor, fragment_12);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_11);
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

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.reset(div);

			var node_16 = $.sibling(div, 2);

			{
				var consequent_3 = ($$anchor) => {
					var span_2 = root_6();
					var text_4 = $.only_child(span_2, true);

					$.template_effect(() => $.set_text(text_4, errors()[id()]));
					$.append($$anchor, span_2);
				};

				$.if(node_16, ($$render) => {
					if (errors() && errors()[id()]) $$render(consequent_3);
				});
			}

			$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn('mb-3 space-y-2', klass()))]);
			$.append($$anchor, fragment_1);
		};

		FormSelectRenderer($$anchor, {
			get data() {
				return $$props.data;
			},

			get value() {
				return value();
			},

			get valueField() {
				return valueField();
			},

			get title() {
				return title();
			},

			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			get triggerRef() {
				return $.get(triggerRef);
			},

			set triggerRef($$value) {
				$.set(triggerRef, $$value, true);
			},

			get searchQuery() {
				return $.get(searchQuery);
			},

			set searchQuery($$value) {
				$.set(searchQuery, $$value, true);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}