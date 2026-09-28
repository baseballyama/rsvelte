import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Tabs_with_dropdown($$renderer) {
	Example($$renderer, {
		title: 'With Dropdown',
		children: ($$renderer) => {
			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					value: 'overview',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex items-center justify-between">`);

						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'overview',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Overview`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'analytics',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Analytics`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'reports',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Reports`);
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
												{ variant: 'ghost', size: 'icon', class: 'size-8' },
												props,
												{
													children: ($$renderer) => {
														IconPlaceholder($$renderer, {
															lucide: 'MoreHorizontalIcon',
															tabler: 'IconDots',
															hugeicons: 'MoreHorizontalCircle01Icon',
															phosphor: 'DotsThreeOutlineIcon',
															remixicon: 'RiMoreLine'
														});

														$$renderer.push(`<!----> <span class="sr-only">More options</span>`);
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
											align: 'end',
											children: ($$renderer) => {
												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Settings`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Export`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Separator) {
													$$renderer.push('<!--[-->');
													DropdownMenu.Separator($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Archive`);
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

						$$renderer.push(`</div> <div class="border style-vega:rounded-lg style-vega:p-6 style-nova:rounded-lg style-nova:p-4 style-lyra:rounded-none style-lyra:p-4 style-maia:rounded-xl style-maia:p-6 style-mira:rounded-md style-mira:p-4 style-luma:rounded-xl style-luma:p-6 style-rhea:rounded-xl style-rhea:p-6">`);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'overview',
								children: ($$renderer) => {
									$$renderer.push(`<!---->View your dashboard metrics and key performance indicators.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'analytics',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Detailed analytics and insights about your data.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'reports',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Generate and view custom reports.`);
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}