import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Blocks from '@lucide/svelte/icons/blocks';
import Brain from '@lucide/svelte/icons/brain';
import LineChart from '@lucide/svelte/icons/chart-line';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Cpu from '@lucide/svelte/icons/cpu';
import Database from '@lucide/svelte/icons/database';
import Globe from '@lucide/svelte/icons/globe';
import Layout from '@lucide/svelte/icons/layout-template';
import Network from '@lucide/svelte/icons/network';
import Search from '@lucide/svelte/icons/search';
import Server from '@lucide/svelte/icons/server';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';

export default function Select_45($$renderer) {
	let open = false;
	let value = '';

	const items = [
		{
			icon: LineChart,
			label: 'Analytics Platform',
			number: 2451,
			value: 'analytics platform'
		},

		{
			icon: Brain,
			label: 'AI Services',
			number: 1832,
			value: 'ai services'
		},

		{
			icon: Database,
			label: 'Database Systems',
			number: 1654,
			value: 'database systems'
		},

		{
			icon: Cpu,
			label: 'Compute Resources',
			number: 943,
			value: 'compute resources'
		},

		{
			icon: Network,
			label: 'Network Services',
			number: 832,
			value: 'network services'
		},

		{
			icon: Globe,
			label: 'Web Services',
			number: 654,
			value: 'web services'
		},

		{
			icon: Search,
			label: 'Monitoring Tools',
			number: 432,
			value: 'monitoring tools'
		},

		{
			icon: Server,
			label: 'Server Management',
			number: 321,
			value: 'server management'
		},

		{
			icon: Blocks,
			label: 'Infrastructure',
			number: 234,
			value: 'infrastructure'
		},

		{
			icon: Layout,
			label: 'Frontend Services',
			number: 123,
			value: 'frontend services'
		}
	];

	const selectedItem = $.derived(() => items.find((item) => item.value === value));

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
				$$renderer.push(`<!---->Options with icon and number`);
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
										if (value && selectedItem()) {
											$$renderer.push('<!--[0-->');

											const IconComponent = selectedItem().icon;

											$$renderer.push(`<span class="flex min-w-0 items-center gap-2">`);

											if (IconComponent) {
												$$renderer.push('<!--[-->');
												IconComponent($$renderer, { class: 'text-muted-foreground h-4 w-4' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <span class="truncate">${$.escape(selectedItem().label)}</span></span>`);
										} else {
											$$renderer.push(`<!--[-1--><span class="text-muted-foreground">Select service category</span>`);
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
												Command.Input($$renderer, { placeholder: 'Search services...' });
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
																	$$renderer.push(`<!---->No service found.`);
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

																	const each_array = $.ensure_array_like(items);

																	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																		let item = each_array[$$index];

																		if (Command.Item) {
																			$$renderer.push('<!--[-->');

																			Command.Item($$renderer, {
																				value: item.value,
																				onSelect: () => handleSelect(item.value),
																				children: ($$renderer) => {
																					$$renderer.push(`<div class="flex items-center gap-2">`);

																					if (item.icon) {
																						$$renderer.push('<!--[-->');
																						item.icon($$renderer, { class: 'text-muted-foreground h-4 w-4' });
																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` ${$.escape(item.label)}</div> <span class="text-muted-foreground text-xs">${$.escape(item.number.toLocaleString())}</span>`);
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
}