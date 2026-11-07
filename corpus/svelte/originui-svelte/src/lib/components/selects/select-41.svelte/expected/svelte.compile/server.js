import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Check from '@lucide/svelte/icons/check';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';
import { cn } from '$lib/utils';

export default function Select_41($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let value = '';

		const frameworks = [
			{ label: 'SvelteKit', value: 'sveltekit' },
			{ label: 'Svelte', value: 'svelte' },
			{ label: 'Nuxt.js', value: 'nuxt.js' },
			{ label: 'Remix', value: 'remix' },
			{ label: 'Astro', value: 'astro' },
			{ label: 'Angular', value: 'angular' },
			{ label: 'Vue.js', value: 'vue' },
			{ label: 'Ember.js', value: 'ember' },
			{ label: 'Gatsby', value: 'gatsby' },
			{ label: 'Eleventy', value: 'eleventy' },
			{ label: 'SolidJS', value: 'solid' },
			{ label: 'Preact', value: 'preact' },
			{ label: 'Qwik', value: 'qwik' },
			{ label: 'Next.js', value: 'next.js' },
			{ label: 'Alpine.js', value: 'alpine' },
			{ label: 'Lit', value: 'lit' }
		];

		function handleSelect(currentValue) {
			value = currentValue === value ? '' : currentValue;
			open = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-2">`);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Select with search`);
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
											$$renderer.push(`<span${$.attr_class($.clsx(cn('truncate', !value && 'text-muted-foreground')))}>`);

											if (value) {
												$$renderer.push(`<!--[0-->${$.escape(frameworks.find((framework) => framework.value === value)?.label)}`);
											} else {
												$$renderer.push(`<!--[-1-->Select framework`);
											}

											$$renderer.push(`<!--]--></span> `);

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
													Command.Input($$renderer, { placeholder: 'Search framework...' });
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
																		$$renderer.push(`<!---->No framework found.`);
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

																		const each_array = $.ensure_array_like(frameworks);

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let framework = each_array[$$index];

																			if (Command.Item) {
																				$$renderer.push('<!--[-->');

																				Command.Item($$renderer, {
																					value: framework.value,
																					onSelect: () => handleSelect(framework.value),
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(framework.label)} `);

																						Check($$renderer, {
																							class: cn('ml-auto', value === framework.value ? 'opacity-100' : 'opacity-0')
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