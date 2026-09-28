import * as $ from 'svelte/internal/server';
import Box from '@lucide/svelte/icons/box';
import House from '@lucide/svelte/icons/house';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

export default function Tab_19($$renderer) {
	Tabs($$renderer, {
		value: 'tab-1',
		orientation: 'vertical',
		class: 'w-full flex-row',
		children: ($$renderer) => {
			TabsList($$renderer, {
				class: 'text-foreground flex-col gap-1 rounded-none bg-transparent px-1 py-0',
				children: ($$renderer) => {
					TabsTrigger($$renderer, {
						value: 'tab-1',
						class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
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
						class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
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
						class: 'hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
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

			$$renderer.push(`<!----> <div class="border-border grow rounded-lg border text-start">`);

			TabsContent($$renderer, {
				value: 'tab-1',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 1</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-2',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 2</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TabsContent($$renderer, {
				value: 'tab-3',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-muted-foreground px-4 py-1.5 text-xs">Content for Tab 3</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}