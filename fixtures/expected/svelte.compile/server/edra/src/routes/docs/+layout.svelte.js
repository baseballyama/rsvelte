import * as $ from 'svelte/internal/server';
import AppSidebar from '$lib/components/custom/AppSidebar.svelte';
import * as Sidebar from '$lib/components/ui/sidebar/index.js';
import ToggleMode from '$lib/components/custom/ToggleMode.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import './layout.css';
import { initPackageManager } from '$lib/edra/docs/packageManager.svelte.js';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		initPackageManager();

		if (Sidebar.Provider) {
			$$renderer.push('<!--[-->');

			Sidebar.Provider($$renderer, {
				class: '[&_a]:no-underline!',
				children: ($$renderer) => {
					AppSidebar($$renderer, { variant: 'sidebar' });
					$$renderer.push(`<!----> `);

					if (Sidebar.Inset) {
						$$renderer.push('<!--[-->');

						Sidebar.Inset($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<header class="sticky top-0 z-10! flex h-14 shrink-0 items-center justify-between gap-2 bg-background/80 px-4 backdrop-blur-xl"><div class="flex items-center gap-2">`);

								if (Sidebar.Trigger) {
									$$renderer.push('<!--[-->');
									Sidebar.Trigger($$renderer, { class: '-ml-1' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <span class="text-sm font-medium text-muted-foreground">Documentation</span></div> <div class="flex items-center gap-4">`);

								Button($$renderer, {
									variant: 'ghost',
									class: 'text-sm font-medium',
									href: '/',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Back to Home`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								ToggleMode($$renderer, {});
								$$renderer.push(`<!----></div></header> <main class="mx-auto w-full max-w-4xl flex-1 overflow-y-auto p-6 md:p-10">`);
								children($$renderer);
								$$renderer.push(`<!----></main>`);
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
	});
}