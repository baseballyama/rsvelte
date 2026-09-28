import * as $ from 'svelte/internal/server';
import { Check, ChevronsUpDown } from '@lucide/svelte';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';
import { Button } from '$lib/components/ui/button';
import { cn } from '$lib/core/utils';
import Label from '../ui/label/label.svelte';
import { Search } from '@lucide/svelte';
import Input from '../ui/input/input.svelte';
import { FormSelectRenderer } from '$lib/core/composables/index.js';

export default function Select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			error = '',
			optional = false,
			info = '',
			class: klass = '',
			showSearch = false,
			success = false,
			optionSelected = (value) => {},
			data,
			id = '',
			title = '',
			errors = {},
			value = '',
			label = '',
			valueField = 'value',
			$$slots,
			$$events,
			...rest
		} = $$props;

		let triggerRef = null;
		let open = false;
		let searchQuery = '';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content(
					$$renderer,
					{ filteredData, selectedValue, closeAndFocusTrigger }
				) {
					$$renderer.push(`<div${$.attr_class($.clsx(cn('mb-3 space-y-2', klass)))}>`);

					if (label) {
						$$renderer.push('<!--[0-->');

						Label($$renderer, {
							class: 'block text-sm font-medium text-gray-700',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(label)} `);

								if (optional) {
									$$renderer.push(`<!--[0--><span class="text-xs text-muted-foreground">(Optional)</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div${$.attributes({ class: 'relative w-full', ...rest })}>`);

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
											{
												'aria-label': 'Open Select Options',
												variant: 'outline',
												class: 'w-full justify-between font-normal'
											},
											props,
											{
												role: 'combobox',
												'aria-expanded': open,
												children: ($$renderer) => {
													$$renderer.push(`<span class="min-w-0 truncate">${$.escape(selectedValue || 'Select...')}</span> `);
													ChevronsUpDown($$renderer, { class: 'ml-2 size-4 shrink-0 opacity-50' });
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
										class: 'relative z-[1000000000] p-0',
										align: 'start',
										children: ($$renderer) => {
											if (Command.Root) {
												$$renderer.push('<!--[-->');

												Command.Root($$renderer, {
													children: ($$renderer) => {
														if (showSearch) {
															$$renderer.push(`<!--[0--><div class="flex items-center px-3">`);
															Search($$renderer, { class: 'mr-2 size-4 shrink-0 opacity-50' });
															$$renderer.push(`<!----> `);

															Input($$renderer, {
																placeholder: 'Search...',
																class: cn('flex h-10 w-full rounded-md border-none bg-transparent py-3 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50'),
																get value() {
																	return searchQuery;
																},

																set value($$value) {
																	searchQuery = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----></div>`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> `);

														if (Command.List) {
															$$renderer.push('<!--[-->');

															Command.List($$renderer, {
																children: ($$renderer) => {
																	if (Command.Empty) {
																		$$renderer.push('<!--[-->');

																		Command.Empty($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Not found.`);
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
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array = $.ensure_array_like(filteredData);

																				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																					let d = each_array[$$index];

																					if (Command.Item) {
																						$$renderer.push('<!--[-->');

																						Command.Item($$renderer, {
																							value: d[valueField],
																							class: 'aria-selected:bg-primary aria-selected:text-primary-foreground',
																							onSelect: () => {
																								optionSelected(d[valueField]);
																								value = d[valueField];
																								closeAndFocusTrigger();
																							},

																							children: ($$renderer) => {
																								Check($$renderer, {
																									class: cn('mr-2 size-4', value !== d[valueField] && 'text-transparent')
																								});

																								$$renderer.push(`<!----> ${$.escape(d.name)}`);
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

					$$renderer.push(`</div></div> `);

					if (errors && errors[id]) {
						$$renderer.push(`<!--[0--><span class="text-red-500">${$.escape(errors[id])}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				FormSelectRenderer($$renderer, {
					data,
					value,
					valueField,
					title,
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					get triggerRef() {
						return triggerRef;
					},

					set triggerRef($$value) {
						triggerRef = $$value;
						$$settled = false;
					},

					get searchQuery() {
						return searchQuery;
					},

					set searchQuery($$value) {
						searchQuery = $$value;
						$$settled = false;
					},
					content,
					$$slots: { content: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}