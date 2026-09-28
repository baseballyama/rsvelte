import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';

export default function Tab_14($$renderer) {
	Tabs($$renderer, {
		value: 'tab-1',
		class: 'items-center',
		children: ($$renderer) => {
			TabsList($$renderer, {
				class: 'mx-auto flex max-w-xs bg-transparent',
				children: ($$renderer) => {
					TabsTrigger($$renderer, {
						value: 'tab-1',
						class: 'group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none',
						children: ($$renderer) => {
							Badge($$renderer, {
								class: 'mb-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50',
								children: ($$renderer) => {
									$$renderer.push(`<!---->3`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> Overview`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabsTrigger($$renderer, {
						value: 'tab-2',
						class: 'group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none',
						children: ($$renderer) => {
							Badge($$renderer, {
								class: 'mb-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50',
								children: ($$renderer) => {
									$$renderer.push(`<!---->0`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> Repositories`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabsTrigger($$renderer, {
						value: 'tab-3',
						class: 'group data-[state=active]:bg-muted flex-1 flex-col p-3 text-xs data-[state=active]:shadow-none',
						children: ($$renderer) => {
							Badge($$renderer, {
								class: 'mb-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50',
								children: ($$renderer) => {
									$$renderer.push(`<!---->7`);
								},
								$$slots: { default: true }
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