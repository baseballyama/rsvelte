import * as $ from 'svelte/internal/server';
import Box from '@lucide/svelte/icons/box';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

export default function Tab_13($$renderer) {
	Tabs($$renderer, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$renderer) => {
			TabsList($$renderer, {
				class: 'border-border h-auto rounded-none border-b bg-transparent p-0',
				children: ($$renderer) => {
					TabsTrigger($$renderer, {
						value: 'tab-1',
						class: 'data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$renderer) => {
							House($$renderer, { class: 'mb-1.5 opacity-60', size: 16, 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Overview`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabsTrigger($$renderer, {
						value: 'tab-2',
						class: 'data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$renderer) => {
							PanelsTopLeft($$renderer, { class: 'mb-1.5 opacity-60', size: 16, 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Repositories`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabsTrigger($$renderer, {
						value: 'tab-3',
						class: 'data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$renderer) => {
							Box($$renderer, { class: 'mb-1.5 opacity-60', size: 16, 'aria-hidden': 'true' });
							$$renderer.push(`<!----> Packages`);
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