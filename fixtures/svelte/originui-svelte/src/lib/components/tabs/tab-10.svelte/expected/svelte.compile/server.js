import * as $ from 'svelte/internal/server';
import Box from '@lucide/svelte/icons/box';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import { ScrollArea, Scrollbar } from '$lib/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

export default function Tab_10($$renderer) {
	Tabs($$renderer, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$renderer) => {
			ScrollArea($$renderer, {
				children: ($$renderer) => {
					TabsList($$renderer, {
						class: 'bg-background mb-3 h-auto -space-x-px p-0 shadow-xs shadow-black/5 rtl:space-x-reverse',
						children: ($$renderer) => {
							TabsTrigger($$renderer, {
								value: 'tab-1',
								class: 'border-border data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e',
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
								class: 'border-border data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e',
								children: ($$renderer) => {
									PanelsTopLeft($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Repositories`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TabsTrigger($$renderer, {
								value: 'tab-3',
								class: 'border-border data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e',
								children: ($$renderer) => {
									Box($$renderer, {
										class: '-ms-0.5 me-1.5 opacity-60',
										size: 16,
										'aria-hidden': 'true'
									});

									$$renderer.push(`<!----> Packages`);
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