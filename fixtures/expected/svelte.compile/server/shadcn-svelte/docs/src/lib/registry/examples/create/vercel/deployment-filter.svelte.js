import * as $ from 'svelte/internal/server';
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { SvelteSet } from "svelte/reactivity";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Deployment_filter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let selectedEnvironment = environments[0];
		let selectedStatuses = new Set(statuses.slice(0, 5).map((s) => s.name));
		let dateRange = undefined;

		function toggleStatus(statusName) {
			const next = new SvelteSet(selectedStatuses);

			if (next.has(statusName)) {
				next.delete(statusName);
			} else {
				next.add(statusName);
			}

			selectedStatuses = next;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Deployment Filter',
				containerClass: 'col-span-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex w-full flex-wrap items-center gap-2 *:w-full lg:*:w-auto">`);

					if (Popover.Root) {
						$$renderer.push('<!--[-->');

						Popover.Root($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											{ variant: 'outline', class: 'justify-start' },
											props,
											{
												children: ($$renderer) => {
													IconPlaceholder($$renderer, {
														lucide: 'CalendarIcon',
														tabler: 'IconCalendar',
														hugeicons: 'Calendar01Icon',
														phosphor: 'CalendarIcon',
														remixicon: 'RiCalendarLine',
														'data-icon': 'inline-start',
														class: 'text-muted-foreground'
													});

													$$renderer.push(`<!----> `);

													if (dateRange?.start) {
														$$renderer.push('<!--[0-->');

														if (dateRange?.end) {
															$$renderer.push(`<!--[0-->${$.escape(dateFormatter.format(dateRange?.start.toDate(getLocalTimeZone())))}
								-
								${$.escape(dateFormatter.format(dateRange?.end.toDate(getLocalTimeZone())))}`);
														} else {
															$$renderer.push(`<!--[-1-->${$.escape(dateFormatter.format(dateRange?.start.toDate(getLocalTimeZone())))}`);
														}

														$$renderer.push(`<!--]-->`);
													} else {
														$$renderer.push(`<!--[-1-->Select Date Range`);
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											}
										]));
									}

									if (Popover.Trigger) {
										$$renderer.push('<!--[-->');
										Popover.Trigger($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
										class: 'w-auto p-0',
										align: 'start',
										children: ($$renderer) => {
											RangeCalendar($$renderer, {
												numberOfMonths: 2,
												get value() {
													return dateRange;
												},

												set value($$value) {
													dateRange = $$value;
													$$settled = false;
												}
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (InputGroup.Root) {
						$$renderer.push('<!--[-->');

						InputGroup.Root($$renderer, {
							class: 'lg:ml-auto lg:max-w-72',
							children: ($$renderer) => {
								if (InputGroup.Addon) {
									$$renderer.push('<!--[-->');

									InputGroup.Addon($$renderer, {
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'Search',
												tabler: 'IconSearch',
												hugeicons: 'Search01Icon',
												phosphor: 'MagnifyingGlassIcon',
												remixicon: 'RiSearchLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (InputGroup.Input) {
									$$renderer.push('<!--[-->');
									InputGroup.Input($$renderer, { placeholder: 'All Authors...' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (InputGroup.Addon) {
									$$renderer.push('<!--[-->');

									InputGroup.Addon($$renderer, {
										align: 'inline-end',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
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

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Root) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Root($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											{ variant: 'outline', class: 'justify-between' },
											props,
											{
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(selectedEnvironment)} `);

													IconPlaceholder($$renderer, {
														lucide: 'ChevronDownIcon',
														tabler: 'IconChevronDown',
														hugeicons: 'ArrowDown01Icon',
														phosphor: 'CaretDownIcon',
														remixicon: 'RiArrowDownSLine',
														'data-icon': 'inline-end',
														class: 'text-muted-foreground'
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											}
										]));
									}

									if (DropdownMenu.Trigger) {
										$$renderer.push('<!--[-->');
										DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (DropdownMenu.Content) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Content($$renderer, {
										class: 'w-56',
										align: 'end',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(environments);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let environment = each_array[$$index];

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														onSelect: () => selectedEnvironment = environment,
														'data-active': selectedEnvironment === environment,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(environment)} `);

															IconPlaceholder($$renderer, {
																lucide: 'CheckIcon',
																tabler: 'IconCheck',
																hugeicons: 'Tick02Icon',
																phosphor: 'CheckIcon',
																remixicon: 'RiCheckLine',
																class: 'ml-auto opacity-0 group-data-[active=true]/dropdown-menu-item:opacity-100'
															});

															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Root) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Root($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											{ variant: 'outline', class: 'justify-between' },
											props,
											{
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center -space-x-0.5"><!--[-->`);

													const each_array_1 = $.ensure_array_like(statuses);

													for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
														let status = each_array_1[$$index_1];

														$$renderer.push(`<div${$.attr_style(`--color: ${$.stringify(status.color)};`)} class="size-2.5 shrink-0 rounded-full border grayscale transition-all data-[active=true]:border-(--color) data-[active=true]:bg-(--color) data-[active=true]:grayscale-0"${$.attr('data-active', selectedStatuses.has(status.name))}></div>`);
													}

													$$renderer.push(`<!--]--></div> Status ${$.escape(selectedStatuses.size)}/${$.escape(statuses.length)} `);

													IconPlaceholder($$renderer, {
														lucide: 'ChevronDownIcon',
														tabler: 'IconChevronDown',
														hugeicons: 'ArrowDown01Icon',
														phosphor: 'CaretDownIcon',
														remixicon: 'RiArrowDownSLine',
														'data-icon': 'inline-end',
														class: 'ml-auto text-muted-foreground'
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											}
										]));
									}

									if (DropdownMenu.Trigger) {
										$$renderer.push('<!--[-->');
										DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (DropdownMenu.Content) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Content($$renderer, {
										class: 'w-56',
										align: 'end',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_2 = $.ensure_array_like(statuses);

											for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
												let status = each_array_2[$$index_2];
												const isSelected = selectedStatuses.has(status.name);

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														onSelect: () => toggleStatus(status.name),
														'data-active': isSelected,
														style: `--color: ${$.stringify(status.color)};`,
														children: ($$renderer) => {
															$$renderer.push(`<div class="flex items-center gap-2"><div class="size-2 rounded-full bg-(--color)"></div> ${$.escape(status.name)}</div> `);

															IconPlaceholder($$renderer, {
																lucide: 'CheckIcon',
																tabler: 'IconCheck',
																hugeicons: 'Tick02Icon',
																phosphor: 'CheckIcon',
																remixicon: 'RiCheckLine',
																class: 'ml-auto opacity-0 group-data-[active=true]/dropdown-menu-item:opacity-100'
															});

															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}