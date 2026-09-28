import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Check from '@lucide/svelte/icons/check';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';
import { cn } from '$lib/utils';

export default function Select_44($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let value = '';

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

			return items.find((item) => item.value === value);
		});

		function handleSelect(currentValue) {
			value = currentValue;
			open = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-2">`);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Options with flag and search`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

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
										variant: 'outline',
										role: 'combobox',
										'aria-expanded': open,
										class: 'bg-background hover:bg-background focus-visible:border-ring focus-visible:outline-ring/20 w-full justify-between px-3 font-normal outline-offset-0 focus-visible:outline-[3px]'
									},
									props,
									{
										children: ($$renderer) => {
											if (value && selectedCountry()) {
												$$renderer.push(`<!--[0--><span class="flex min-w-0 items-center gap-2"><span class="text-lg leading-none">${$.escape(selectedCountry().flag)}</span> <span class="truncate">${$.escape(value)}</span></span>`);
											} else {
												$$renderer.push(`<!--[-1--><span class="text-muted-foreground">Select country</span>`);
											}

											$$renderer.push(`<!--]--> `);

											ChevronDown($$renderer, {
												size: 16,
												class: 'text-muted-foreground/80 shrink-0',
												'aria-hidden': 'true'
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
								class: 'w-full min-w-(--bits-popover-anchor-width) p-0',
								align: 'start',
								children: ($$renderer) => {
									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');
													Command.Input($$renderer, { placeholder: 'Search country...' });
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
																		$$renderer.push(`<!---->No country found.`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` <!--[-->`);

															const each_array = $.ensure_array_like(countries);

															for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
																let group = each_array[$$index_1];

																if (Command.Group) {
																	$$renderer.push('<!--[-->');

																	Command.Group($$renderer, {
																		heading: group.continent,
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_1 = $.ensure_array_like(group.items);

																			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																				let country = each_array_1[$$index];

																				if (Command.Item) {
																					$$renderer.push('<!--[-->');

																					Command.Item($$renderer, {
																						value: country.value,
																						onSelect: () => handleSelect(country.value),
																						children: ($$renderer) => {
																							$$renderer.push(`<span class="text-lg leading-none">${$.escape(country.flag)}</span> ${$.escape(country.value)} `);

																							Check($$renderer, {
																								class: cn('ml-auto', value === country.value ? 'opacity-100' : 'opacity-0')
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

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}