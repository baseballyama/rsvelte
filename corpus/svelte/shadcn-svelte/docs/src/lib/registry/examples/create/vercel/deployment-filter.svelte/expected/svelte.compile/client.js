import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { SvelteSet } from "svelte/reactivity";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<div class="size-2.5 shrink-0 rounded-full border grayscale transition-all data-[active=true]:border-(--color) data-[active=true]:bg-(--color) data-[active=true]:grayscale-0"></div>`);
var root_4 = $.from_html(`<div class="flex items-center -space-x-0.5"></div> <!>`, 1);
var root_5 = $.from_html(`<div class="flex items-center gap-2"><div class="size-2 rounded-full bg-(--color)"></div> </div> <!>`, 1);
var root_6 = $.from_html(`<div class="flex w-full flex-wrap items-center gap-2 *:w-full lg:*:w-auto"><!> <!> <!> <!></div>`);

export default function Deployment_filter($$anchor, $$props) {
	$.push($$props, true);

	const environments = [
		"All Environments",
		"Production",
		"Preview",
		"Development",
		"Staging",
		"Test",
		"Other"
	];

	const statuses = [
		{ name: "Ready", color: "oklch(0.72 0.19 150)" },
		{ name: "Error", color: "oklch(0.64 0.21 25)" },
		{ name: "Building", color: "oklch(0.77 0.16 70)" },
		{ name: "Queued", color: "oklch(0.72 0.00 0)" },
		{ name: "Provisioning", color: "oklch(0.72 0.00 0)" },
		{ name: "Canceled", color: "oklch(0.72 0.00 0)" }
	];

	const dateFormatter = new DateFormatter("en-US", { month: "short", day: "2-digit", year: "numeric" });
	let selectedEnvironment = $.state($.proxy(environments[0]));
	let selectedStatuses = $.state($.proxy(new Set(statuses.slice(0, 5).map((s) => s.name))));
	let dateRange = $.state(undefined);

	function toggleStatus(statusName) {
		const next = new SvelteSet($.get(selectedStatuses));

		if (next.has(statusName)) {
			next.delete(statusName);
		} else {
			next.add(statusName);
		}

		$.set(selectedStatuses, next, true);
	}

	Example($$anchor, {
		title: 'Deployment Filter',
		containerClass: 'col-span-full',
		children: ($$anchor, $$slotProps) => {
			var div = root_6();
			var node = $.child(div);

			$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', class: 'justify-start' }, props, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_2 = $.first_child(fragment_3);

										IconPlaceholder(node_2, {
											lucide: 'CalendarIcon',
											tabler: 'IconCalendar',
											hugeicons: 'Calendar01Icon',
											phosphor: 'CalendarIcon',
											remixicon: 'RiCalendarLine',
											'data-icon': 'inline-start',
											class: 'text-muted-foreground'
										});

										var node_3 = $.sibling(node_2, 2);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												{
													var consequent = ($$anchor) => {
														var text = $.text();

														$.template_effect(
															($0, $1) => $.set_text(text, `${$0 ?? ''}
								-
								${$1 ?? ''}`),
															[
																() => dateFormatter.format($.get(dateRange)?.start.toDate(getLocalTimeZone())),
																() => dateFormatter.format($.get(dateRange)?.end.toDate(getLocalTimeZone()))
															]
														);

														$.append($$anchor, text);
													};

													var alternate = ($$anchor) => {
														var text_1 = $.text();

														$.template_effect(($0) => $.set_text(text_1, $0), [
															() => dateFormatter.format($.get(dateRange)?.start.toDate(getLocalTimeZone()))
														]);

														$.append($$anchor, text_1);
													};

													$.if(node_4, ($$render) => {
														if ($.get(dateRange)?.end) $$render(consequent); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_4);
											};

											var alternate_1 = ($$anchor) => {
												var text_2 = $.text('Select Date Range');

												$.append($$anchor, text_2);
											};

											$.if(node_3, ($$render) => {
												if ($.get(dateRange)?.start) $$render(consequent_1); else $$render(alternate_1, -1);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
								Popover_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_5 = $.sibling(node_1, 2);

						$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'w-auto p-0',
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									RangeCalendar($$anchor, {
										numberOfMonths: 2,
										get value() {
											return $.get(dateRange);
										},

										set value($$value) {
											$.set(dateRange, $$value, true);
										}
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node, 2);

			$.component(node_6, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
				InputGroup_Root($$anchor, {
					class: 'lg:ml-auto lg:max-w-72',
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_1();
						var node_7 = $.first_child(fragment_8);

						$.component(node_7, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
							InputGroup_Addon($$anchor, {
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'Search',
										tabler: 'IconSearch',
										hugeicons: 'Search01Icon',
										phosphor: 'MagnifyingGlassIcon',
										remixicon: 'RiSearchLine'
									});
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
							InputGroup_Input($$anchor, { placeholder: 'All Authors...' });
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
							InputGroup_Addon_1($$anchor, {
								align: 'inline-end',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'ChevronDownIcon',
										tabler: 'IconChevronDown',
										hugeicons: 'ArrowDown01Icon',
										phosphor: 'CaretDownIcon',
										remixicon: 'RiArrowDownSLine',
										class: 'text-muted-foreground'
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			var node_10 = $.sibling(node_6, 2);

			$.component(node_10, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root();
						var node_11 = $.first_child(fragment_11);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', class: 'justify-between' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_13 = root_2();
										var text_3 = $.first_child(fragment_13);
										var node_12 = $.sibling(text_3);

										IconPlaceholder(node_12, {
											lucide: 'ChevronDownIcon',
											tabler: 'IconChevronDown',
											hugeicons: 'ArrowDown01Icon',
											phosphor: 'CaretDownIcon',
											remixicon: 'RiArrowDownSLine',
											'data-icon': 'inline-end',
											class: 'text-muted-foreground'
										});

										$.template_effect(() => $.set_text(text_3, `${$.get(selectedEnvironment) ?? ''} `));
										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_11, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_13 = $.sibling(node_11, 2);

						$.component(node_13, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								class: 'w-56',
								align: 'end',
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = $.comment();
									var node_14 = $.first_child(fragment_14);

									$.each(node_14, 16, () => environments, (environment) => environment, ($$anchor, environment) => {
										var fragment_15 = $.comment();
										var node_15 = $.first_child(fragment_15);

										{
											let $0 = $.derived(() => $.get(selectedEnvironment) === environment);

											$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
												DropdownMenu_Item($$anchor, {
													onSelect: () => $.set(selectedEnvironment, environment, true),
													get 'data-active'() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_16 = root_2();
														var text_4 = $.first_child(fragment_16);
														var node_16 = $.sibling(text_4);

														IconPlaceholder(node_16, {
															lucide: 'CheckIcon',
															tabler: 'IconCheck',
															hugeicons: 'Tick02Icon',
															phosphor: 'CheckIcon',
															remixicon: 'RiCheckLine',
															class: 'ml-auto opacity-0 group-data-[active=true]/dropdown-menu-item:opacity-100'
														});

														$.template_effect(() => $.set_text(text_4, `${environment ?? ''} `));
														$.append($$anchor, fragment_16);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_15);
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			var node_17 = $.sibling(node_10, 2);

			$.component(node_17, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
				DropdownMenu_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_17 = root();
						var node_18 = $.first_child(fragment_17);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', class: 'justify-between' }, props, {
									children: ($$anchor, $$slotProps) => {
										var fragment_19 = root_4();
										var div_1 = $.first_child(fragment_19);

										$.each(div_1, 21, () => statuses, (status) => status.name, ($$anchor, status) => {
											var div_2 = root_3();

											$.template_effect(
												($0) => {
													$.set_style(div_2, `--color: ${$.get(status).color ?? ''};`);
													$.set_attribute(div_2, 'data-active', $0);
												},
												[() => $.get(selectedStatuses).has($.get(status).name)]
											);

											$.append($$anchor, div_2);
										});

										$.reset(div_1);

										var text_5 = $.sibling(div_1);
										var node_19 = $.sibling(text_5);

										IconPlaceholder(node_19, {
											lucide: 'ChevronDownIcon',
											tabler: 'IconChevronDown',
											hugeicons: 'ArrowDown01Icon',
											phosphor: 'CaretDownIcon',
											remixicon: 'RiArrowDownSLine',
											'data-icon': 'inline-end',
											class: 'ml-auto text-muted-foreground'
										});

										$.template_effect(() => $.set_text(text_5, ` Status ${$.get(selectedStatuses).size ?? ''}/${statuses.length ?? ''} `));
										$.append($$anchor, fragment_19);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_18, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
								DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_20 = $.sibling(node_18, 2);

						$.component(node_20, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
							DropdownMenu_Content_1($$anchor, {
								class: 'w-56',
								align: 'end',
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = $.comment();
									var node_21 = $.first_child(fragment_20);

									$.each(node_21, 17, () => statuses, (status) => status.name, ($$anchor, status) => {
										const isSelected = $.derived(() => $.get(selectedStatuses).has($.get(status).name));
										var fragment_21 = $.comment();
										var node_22 = $.first_child(fragment_21);

										$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
											DropdownMenu_Item_1($$anchor, {
												onSelect: () => toggleStatus($.get(status).name),
												get 'data-active'() {
													return $.get(isSelected);
												},

												get style() {
													return `--color: ${$.get(status).color ?? ''};`;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_22 = root_5();
													var div_3 = $.first_child(fragment_22);
													var text_6 = $.sibling($.child(div_3));

													$.reset(div_3);

													var node_23 = $.sibling(div_3, 2);

													IconPlaceholder(node_23, {
														lucide: 'CheckIcon',
														tabler: 'IconCheck',
														hugeicons: 'Tick02Icon',
														phosphor: 'CheckIcon',
														remixicon: 'RiCheckLine',
														class: 'ml-auto opacity-0 group-data-[active=true]/dropdown-menu-item:opacity-100'
													});

													$.template_effect(() => $.set_text(text_6, ` ${$.get(status).name ?? ''}`));
													$.append($$anchor, fragment_22);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_21);
									});

									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_17);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}