import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import Box from '@lucide/svelte/icons/box';
import ChartLine from '@lucide/svelte/icons/chart-line';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import Settings from '@lucide/svelte/icons/settings';
import UsersRound from '@lucide/svelte/icons/users-round';
import { ScrollArea, Scrollbar } from '$lib/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

export default function Tab_12($$renderer) {
	Tabs($$renderer, {
		value: 'tab-1',
		children: ($$renderer) => {
			ScrollArea($$renderer, {
				children: ($$renderer) => {
					TabsList($$renderer, {
						class: 'text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1',
						children: ($$renderer) => {
							TabsTrigger($$renderer, {
								value: 'tab-1',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$renderer) => {
									House($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Overview`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TabsTrigger($$renderer, {
								value: 'tab-2',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$renderer) => {
									PanelsTopLeft($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Repositories `);

									Badge($$renderer, {
										class: 'bg-primary/15 ms-1.5 min-w-5 px-1',
										variant: 'secondary',
										children: ($$renderer) => {
											$$renderer.push(`<!---->3`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TabsTrigger($$renderer, {
								value: 'tab-3',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$renderer) => {
									Box($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Packages `);

									Badge($$renderer, {
										class: 'ms-1.5',
										children: ($$renderer) => {
											$$renderer.push(`<!---->New`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TabsTrigger($$renderer, {
								value: 'tab-4',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$renderer) => {
									UsersRound($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Team`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TabsTrigger($$renderer, {
								value: 'tab-5',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$renderer) => {
									ChartLine($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Insights`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TabsTrigger($$renderer, {
								value: 'tab-6',
								class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
								children: ($$renderer) => {
									Settings($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Settings`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Scrollbar($$renderer, { orientation: 'horizontal' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-1',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 1</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-2',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 2</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-3',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 3</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-4',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 4</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-5',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 5</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-6',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground pt-1 text-center text-xs">Content for Tab 6</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}