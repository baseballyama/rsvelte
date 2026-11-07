import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import Box from '@lucide/svelte/icons/box';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';

export default function Tab_15($$renderer) {
	Tabs($$renderer, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$renderer) => {
			TabsList($$renderer, {
				children: ($$renderer) => {
					TooltipProvider($$renderer, {
						delayDuration: 0,
						children: ($$renderer) => {
							Tooltip($$renderer, {
								children: ($$renderer) => {
									{
										function child($$renderer, { props }) {
											$$renderer.push(`<span${$.attributes({ ...props })}>`);

											TabsTrigger($$renderer, {
												value: 'tab-1',
												class: 'py-3',
												children: ($$renderer) => {
													House($$renderer, { size: 16, 'aria-hidden': 'true' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></span>`);
										}

										TooltipTrigger($$renderer, { child, $$slots: { child: true } });
									}

									$$renderer.push(`<!----> `);

									TooltipContent($$renderer, {
										class: 'px-2 py-1 text-xs',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Overview`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TooltipProvider($$renderer, {
						delayDuration: 0,
						children: ($$renderer) => {
							Tooltip($$renderer, {
								children: ($$renderer) => {
									{
										function child($$renderer, { props }) {
											$$renderer.push(`<span${$.attributes({ ...props })}>`);

											TabsTrigger($$renderer, {
												value: 'tab-2',
												class: 'group py-3',
												children: ($$renderer) => {
													$$renderer.push(`<span class="relative">`);
													PanelsTopLeft($$renderer, { size: 16, 'aria-hidden': 'true' });
													$$renderer.push(`<!----> `);

													Badge($$renderer, {
														class: 'border-background absolute -top-2.5 left-full min-w-4 -translate-x-1.5 px-0.5 text-[10px]/[.875rem] transition-opacity group-data-[state=inactive]:opacity-50',
														children: ($$renderer) => {
															$$renderer.push(`<!---->3`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></span>`);
										}

										TooltipTrigger($$renderer, { child, $$slots: { child: true } });
									}

									$$renderer.push(`<!----> `);

									TooltipContent($$renderer, {
										class: 'px-2 py-1 text-xs',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Repositories`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TooltipProvider($$renderer, {
						delayDuration: 0,
						children: ($$renderer) => {
							Tooltip($$renderer, {
								children: ($$renderer) => {
									{
										function child($$renderer, { props }) {
											$$renderer.push(`<span${$.attributes({ ...props })}>`);

											TabsTrigger($$renderer, {
												value: 'tab-3',
												class: 'py-3',
												children: ($$renderer) => {
													Box($$renderer, { size: 16, 'aria-hidden': 'true' });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----></span>`);
										}

										TooltipTrigger($$renderer, { child, $$slots: { child: true } });
									}

									$$renderer.push(`<!----> `);

									TooltipContent($$renderer, {
										class: 'px-2 py-1 text-xs',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Packages`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-1',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 1</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-2',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 2</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-3',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground p-4 text-center text-xs">Content for Tab 3</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}