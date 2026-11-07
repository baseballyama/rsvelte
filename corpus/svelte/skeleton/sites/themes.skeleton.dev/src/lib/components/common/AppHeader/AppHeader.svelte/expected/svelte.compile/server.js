import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import LightSwitch from '$lib/components/common/LightSwitch/LightSwitch.svelte';
import Logo from '$lib/components/common/Logo/Logo.svelte';
import { AppBar } from '@skeletonlabs/skeleton-svelte';

export default function AppHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		AppBar($$renderer, {
			class: 'sticky top-0 z-10 border-b-[1px] border-surface-500/20 bg-surface-50-950',
			children: ($$renderer) => {
				if (AppBar.Toolbar) {
					$$renderer.push('<!--[-->');

					AppBar.Toolbar($$renderer, {
						class: 'grid-cols-[auto_1fr_auto] justify-between',
						children: ($$renderer) => {
							if (AppBar.Lead) {
								$$renderer.push('<!--[-->');

								AppBar.Lead($$renderer, {
									class: 'flex items-center gap-6',
									children: ($$renderer) => {
										$$renderer.push(`<a href="https://skeleton.dev/docs/design/themes" title="Skeleton" class="flex items-center gap-4">`);
										Logo($$renderer, {});
										$$renderer.push(`<!----></a>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (AppBar.Headline) {
								$$renderer.push('<!--[-->');

								AppBar.Headline($$renderer, {
									class: 'flex opacity-60',
									children: ($$renderer) => {
										$$renderer.push(`<a${$.attr('href', resolve('/themes/create'))} class="btn hover:preset-tonal">Create</a> <a${$.attr('href', resolve('/themes/import'))} class="btn hover:preset-tonal">Import</a>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (AppBar.Trail) {
								$$renderer.push('<!--[-->');

								AppBar.Trail($$renderer, {
									class: 'flex items-center gap-4',
									children: ($$renderer) => {
										LightSwitch($$renderer, {});
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
			},
			$$slots: { default: true }
		});
	});
}