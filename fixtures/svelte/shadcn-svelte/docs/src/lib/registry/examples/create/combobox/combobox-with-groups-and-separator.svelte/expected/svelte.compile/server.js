import * as $ from 'svelte/internal/server';
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Combobox_with_groups_and_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const timezones = [
			{
				value: "Americas",
				items: [
					"(GMT-5) New York",
					"(GMT-8) Los Angeles",
					"(GMT-6) Chicago",
					"(GMT-5) Toronto",
					"(GMT-8) Vancouver",
					"(GMT-3) São Paulo"
				]
			},

			{
				value: "Europe",
				items: [
					"(GMT+0) London",
					"(GMT+1) Paris",
					"(GMT+1) Berlin",
					"(GMT+1) Rome",
					"(GMT+1) Madrid",
					"(GMT+1) Amsterdam"
				]
			},

			{
				value: "Asia/Pacific",
				items: [
					"(GMT+9) Tokyo",
					"(GMT+8) Shanghai",
					"(GMT+8) Singapore",
					"(GMT+4) Dubai",
					"(GMT+11) Sydney",
					"(GMT+9) Seoul"
				]
			}
		];

		let open = false;
		let value = "";
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
				title: 'With Groups and Separator',
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
													$$renderer.push(`<!---->${$.escape(value || "Select a timezone")} `);

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
										class: 'w-[200px] p-0',
										align: 'start',
										children: ($$renderer) => {
											if (Command.Root) {
												$$renderer.push('<!--[-->');

												Command.Root($$renderer, {
													children: ($$renderer) => {
														if (Command.Input) {
															$$renderer.push('<!--[-->');
															Command.Input($$renderer, { placeholder: 'Search timezone...' });
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
																				$$renderer.push(`<!---->No timezones found.`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` <!--[-->`);

																	const each_array = $.ensure_array_like(timezones);

																	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
																		let group = each_array[$$index_1];

																		if (Command.Group) {
																			$$renderer.push('<!--[-->');

																			Command.Group($$renderer, {
																				heading: group.value,
																				value: group.value,
																				children: ($$renderer) => {
																					$$renderer.push(`<!--[-->`);

																					const each_array_1 = $.ensure_array_like(group.items);

																					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																						let item = each_array_1[$$index];

																						if (Command.Item) {
																							$$renderer.push('<!--[-->');

																							Command.Item($$renderer, {
																								value: item,
																								onSelect: () => {
																									value = item;
																									closeAndFocusTrigger();
																								},

																								children: ($$renderer) => {
																									IconPlaceholder($$renderer, {
																										lucide: 'CheckIcon',
																										tabler: 'IconCheck',
																										hugeicons: 'Tick02Icon',
																										phosphor: 'CheckIcon',
																										remixicon: 'RiCheckLine',
																										class: cn(value !== item && "text-transparent")
																									});

																									$$renderer.push(`<!----> ${$.escape(item)}`);
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

																		$$renderer.push(` `);

																		if (Command.Separator) {
																			$$renderer.push('<!--[-->');
																			Command.Separator($$renderer, {});
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}