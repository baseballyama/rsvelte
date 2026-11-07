import * as $ from 'svelte/internal/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

export default function Tab_07($$renderer) {
	Tabs($$renderer, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$renderer) => {
			TabsList($$renderer, {
				class: 'before:bg-border relative h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px',
				children: ($$renderer) => {
					TabsTrigger($$renderer, {
						value: 'tab-1',
						class: 'border-border bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tab 1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabsTrigger($$renderer, {
						value: 'tab-2',
						class: 'border-border bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tab 2`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabsTrigger($$renderer, {
						value: 'tab-3',
						class: 'border-border bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tab 3`);
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