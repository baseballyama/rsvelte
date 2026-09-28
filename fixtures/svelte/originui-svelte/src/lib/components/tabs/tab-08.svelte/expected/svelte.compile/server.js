import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import Box from '@lucide/svelte/icons/box';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import { ScrollArea, Scrollbar } from '$lib/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

export default function Tab_08($$renderer) {
	Tabs($$renderer, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$renderer) => {
			ScrollArea($$renderer, {
				children: ($$renderer) => {
					TabsList($$renderer, {
						class: 'mb-3',
						children: ($$renderer) => {
							TabsTrigger($$renderer, {
								value: 'tab-1',
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
								class: 'group',
								children: ($$renderer) => {
									PanelsTopLeft($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Repositories `);

									Badge($$renderer, {
										class: 'bg-primary/15 ms-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50',
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
								class: 'group',
								children: ($$renderer) => {
									Box($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Packages `);

									Badge($$renderer, {
										class: 'ms-1.5 transition-opacity group-data-[state=inactive]:opacity-50',
										children: ($$renderer) => {
											$$renderer.push(`<!---->New`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
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
					$$renderer.push(`<p class="text-muted-foreground p-4 pt-1 text-center text-xs">Content for Tab 1</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-2',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground p-4 pt-1 text-center text-xs">Content for Tab 2</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-3',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground p-4 pt-1 text-center text-xs">Content for Tab 3</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}