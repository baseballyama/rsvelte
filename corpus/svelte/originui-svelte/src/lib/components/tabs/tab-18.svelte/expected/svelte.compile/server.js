import * as $ from 'svelte/internal/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

export default function Tab_18($$renderer) {
	Tabs($$renderer, {
		value: 'tab-1',
		orientation: 'vertical',
		class: 'w-full flex-row',
		children: ($$renderer) => {
			TabsList($$renderer, {
				class: 'border-border flex-col rounded-none border-l bg-transparent p-0',
				children: ($$renderer) => {
					TabsTrigger($$renderer, {
						value: 'tab-1',
						class: 'data-[state=active]:after:bg-primary relative w-full justify-start rounded-none after:absolute after:inset-y-0 after:start-0 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Overview`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabsTrigger($$renderer, {
						value: 'tab-2',
						class: 'data-[state=active]:after:bg-primary relative w-full justify-start rounded-none after:absolute after:inset-y-0 after:start-0 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Repositories`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabsTrigger($$renderer, {
						value: 'tab-3',
						class: 'data-[state=active]:after:bg-primary relative w-full justify-start rounded-none after:absolute after:inset-y-0 after:start-0 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Packages`);
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