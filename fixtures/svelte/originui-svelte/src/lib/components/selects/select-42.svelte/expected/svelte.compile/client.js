import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Check from '@lucide/svelte/icons/check';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Plus from '@lucide/svelte/icons/plus';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';
import { cn } from '$lib/utils';

var root = $.from_html(`<span><!></span> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> New organization`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_42($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let value = $.state('originui');

	const organizations = [
		{ label: 'Origin UI - Svelte', value: 'originui' },
		{ label: 'Bits UI', value: 'bitsui' }
	];

	function handleSelect(currentValue) {
		$.set(value, currentValue === $.get(value) ? '' : currentValue, true);
		$.set(open, false);
	}

	var div = root_5();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select with search and button');

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
				var fragment = root_4();
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
									var fragment_2 = root();
									var span = $.first_child(fragment_2);
									var node_3 = $.child(span);

									{
										var consequent = ($$anchor) => {
											var text_1 = $.text();

											$.template_effect(($0) => $.set_text(text_1, $0), [
												() => organizations.find((organization) => organization.value === $.get(value))?.label
											]);

											$.append($$anchor, text_1);
										};

										var alternate = ($$anchor) => {
											var text_2 = $.text('Select organization');

											$.append($$anchor, text_2);
										};

										$.if(node_3, ($$render) => {
											if ($.get(value)) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.reset(span);

									var node_4 = $.sibling(span, 2);

									ChevronDown(node_4, {
										size: 16,
										class: 'text-muted-foreground/80 shrink-0',
										'aria-hidden': 'true'
									});

									$.template_effect(($0) => $.set_class(span, 1, $0), [
										() => $.clsx(cn('truncate', !$.get(value) && 'text-muted-foreground'))
									]);

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
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.component(node_6, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_4();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Find organization' });
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_3();
													var node_9 = $.first_child(fragment_6);

													$.component(node_9, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('No organization found.');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = $.comment();
																var node_11 = $.first_child(fragment_7);

																$.each(node_11, 17, () => organizations, (organization) => organization.value, ($$anchor, organization) => {
																	var fragment_8 = $.comment();
																	var node_12 = $.first_child(fragment_8);

																	$.component(node_12, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			get value() {
																				return $.get(organization).value;
																			},
																			onSelect: () => handleSelect($.get(organization).value),
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var fragment_9 = root_1();
																				var text_4 = $.first_child(fragment_9);
																				var node_13 = $.sibling(text_4);

																				{
																					let $0 = $.derived(() => cn('ml-auto', $.get(value) === $.get(organization).value ? 'opacity-100' : 'opacity-0'));

																					Check(node_13, {
																						get class() {
																							return $.get($0);
																						}
																					});
																				}

																				$.template_effect(() => $.set_text(text_4, `${$.get(organization).label ?? ''} `));
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

													var node_14 = $.sibling(node_10, 2);

													$.component(node_14, () => Command.Separator, ($$anchor, Command_Separator) => {
														Command_Separator($$anchor, {});
													});

													var node_15 = $.sibling(node_14, 2);

													$.component(node_15, () => Command.Group, ($$anchor, Command_Group_1) => {
														Command_Group_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																Button($$anchor, {
																	variant: 'ghost',
																	class: 'w-full justify-start font-normal',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = root_2();
																		var node_16 = $.first_child(fragment_11);

																		Plus(node_16, {
																			size: 16,
																			class: '-ms-2 me-2 opacity-60',
																			'aria-hidden': 'true'
																		});

																		$.next();
																		$.append($$anchor, fragment_11);
																	},
																	$$slots: { default: true }
																});
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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}