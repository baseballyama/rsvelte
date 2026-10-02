import * as $ from 'svelte/internal/server';
import * as Popover from '$lib/components/ui/popover';
import Button from '$lib/components/button.svelte';
import * as Command from '$lib/components/ui/command';
import { ScrollArea } from '$lib/components/ui/scroll-area';
import CheckIcon from '@lucide/svelte/icons/check';
import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
import { cn } from '$lib/utils.js';
import Flag from './flag.svelte';

export default function Country_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** List of countries */
		/** Default ordering is alphabetical by country name supply this function to customize the sorting behavior  */
		let {
			countries,
			disabled = false,
			selected = null,
			onselect = undefined,
			order = (a, b) => {
				return a.name.localeCompare(b.name);
			}
		} = $$props;

		let selectedCountry = $.derived(() => countries.find((a) => a.iso2 == selected));
		let open = false;
		let selectedValue = false;

		function selectCountry(country) {
			selected = country.iso2;
			selectedValue = true;
			open = false;
			onselect?.(selected);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
										type: 'button',
										variant: 'outline',
										class: cn('flex shrink-0 gap-1 rounded-l-lg rounded-r-none px-3'),
										disabled,
										children: ($$renderer) => {
											Flag($$renderer, { country: selectedCountry() });
											$$renderer.push(`<!----> `);

											ChevronsUpDownIcon($$renderer, {
												class: cn('-mr-2 h-4 w-4 opacity-50', disabled ? 'hidden' : 'opacity-100')
											});

											$$renderer.push(`<!---->`);
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
								class: 'w-[300px] p-0',
								align: 'start',
								onCloseAutoFocus: (e) => {
									if (selectedValue) {
										selectedValue = false;
										e.preventDefault();
									}
								},

								children: ($$renderer) => {
									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');
													Command.Input($$renderer, { placeholder: 'Search...' });
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
															ScrollArea($$renderer, {
																class: 'h-72',
																children: ($$renderer) => {
																	if (Command.Empty) {
																		$$renderer.push('<!--[-->');

																		Command.Empty($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->No country found.`);
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
																			class: 'overflow-clip',
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array = $.ensure_array_like(countries.sort(order));

																				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																					let country = each_array[$$index];

																					if (Command.Item) {
																						$$renderer.push('<!--[-->');

																						Command.Item($$renderer, {
																							class: 'gap-2 [&_.cn-command-item-indicator]:hidden',
																							value: country.name,
																							onSelect: () => selectCountry(country),
																							children: ($$renderer) => {
																								Flag($$renderer, { country });
																								$$renderer.push(`<!----> <span class="flex-1 text-sm">${$.escape(country.name)}</span> <span class="text-foreground/50 text-sm">+${$.escape(country.dialCode)}</span> <div class="w-4">`);

																								if (country.iso2 == selected) {
																									$$renderer.push('<!--[0-->');
																									CheckIcon($$renderer, { class: 'phone-input-check-icon size-4' });
																								} else {
																									$$renderer.push('<!--[-1-->');
																								}

																								$$renderer.push(`<!--]--></div>`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { selected });
	});
}