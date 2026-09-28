import * as $ from 'svelte/internal/server';
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Combobox_with_custom_items($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = [
			{
				code: "us",
				value: "united-states",
				label: "United States",
				continent: "North America"
			},

			{
				code: "gb",
				value: "united-kingdom",
				label: "United Kingdom",
				continent: "Europe"
			},

			{
				code: "ca",
				value: "canada",
				label: "Canada",
				continent: "North America"
			},

			{
				code: "au",
				value: "australia",
				label: "Australia",
				continent: "Oceania"
			},

			{
				code: "de",
				value: "germany",
				label: "Germany",
				continent: "Europe"
			},

			{
				code: "fr",
				value: "france",
				label: "France",
				continent: "Europe"
			},

			{
				code: "jp",
				value: "japan",
				label: "Japan",
				continent: "Asia"
			},

			{
				code: "cn",
				value: "china",
				label: "China",
				continent: "Asia"
			},

			{
				code: "br",
				value: "brazil",
				label: "Brazil",
				continent: "South America"
			},

			{
				code: "in",
				value: "india",
				label: "India",
				continent: "Asia"
			}
		];

		let open = false;
		let value = null;
		let triggerRef = null;

		function closeAndFocusTrigger() {
			open = false;

			tick().then(() => {
				triggerRef?.focus();
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'With Custom Item Rendering',
				children: ($$renderer) => {
					if (Popover.Root) {
						$$renderer.push('<!--[-->');

						Popover.Root($$renderer, {
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											props,
											{
												variant: 'outline',
												class: 'w-[200px] justify-between font-normal',
												role: 'combobox',
												'aria-expanded': open,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(value?.label ?? "Search countries...")} `);

													IconPlaceholder($$renderer, {
														lucide: 'ChevronDownIcon',
														tabler: 'IconChevronDown',
														hugeicons: 'ArrowDown01Icon',
														phosphor: 'CaretDownIcon',
														remixicon: 'RiArrowDownSLine',
														class: 'size-4 text-muted-foreground opacity-50'
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											}
										]));
									}

									if (Popover.Trigger) {
										$$renderer.push('<!--[-->');

										Popover.Trigger($$renderer, {
											get ref() {
												return triggerRef;
											},

											set ref($$value) {
												triggerRef = $$value;
												$$settled = false;
											},
											child,
											$$slots: { child: true }
										});

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
										class: 'w-[280px] p-0',
										align: 'start',
										children: ($$renderer) => {
											if (Command.Root) {
												$$renderer.push('<!--[-->');

												Command.Root($$renderer, {
													children: ($$renderer) => {
														if (Command.Input) {
															$$renderer.push('<!--[-->');
															Command.Input($$renderer, { placeholder: 'Search countries...' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Command.List) {
															$$renderer.push('<!--[-->');

															Command.List($$renderer, {
																children: ($$renderer) => {
																	if (Command.Empty) {
																		$$renderer.push('<!--[-->');

																		Command.Empty($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->No countries found.`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Command.Group) {
																		$$renderer.push('<!--[-->');

																		Command.Group($$renderer, {
																			value: 'countries',
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array = $.ensure_array_like(countries);

																				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																					let country = each_array[$$index];

																					if (Command.Item) {
																						$$renderer.push('<!--[-->');

																						Command.Item($$renderer, {
																							value: country.label,
																							onSelect: () => {
																								value = country;
																								closeAndFocusTrigger();
																							},

																							children: ($$renderer) => {
																								IconPlaceholder($$renderer, {
																									lucide: 'CheckIcon',
																									tabler: 'IconCheck',
																									hugeicons: 'Tick02Icon',
																									phosphor: 'CheckIcon',
																									remixicon: 'RiCheckLine',
																									class: cn(value?.code !== country.code && "text-transparent")
																								});

																								$$renderer.push(`<!----> `);

																								if (Item.Root) {
																									$$renderer.push('<!--[-->');

																									Item.Root($$renderer, {
																										size: 'xs',
																										class: 'p-0',
																										children: ($$renderer) => {
																											if (Item.Content) {
																												$$renderer.push('<!--[-->');

																												Item.Content($$renderer, {
																													children: ($$renderer) => {
																														if (Item.Title) {
																															$$renderer.push('<!--[-->');

																															Item.Title($$renderer, {
																																class: 'whitespace-nowrap',
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->${$.escape(country.label)}`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														if (Item.Description) {
																															$$renderer.push('<!--[-->');

																															Item.Description($$renderer, {
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->${$.escape(country.continent)} (${$.escape(country.code)})`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}