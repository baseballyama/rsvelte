import * as $ from 'svelte/internal/server';
import { features } from '$lib/data';
import { Title, Text, SimpleGrid, ThemeIcon, Center, Stack, Paper } from '@svelteuidev/core';
import { fly } from 'svelte/transition';

export default function Features($$renderer) {
	$$renderer.push(`<div id="wrapper">`);

	SimpleGrid($$renderer, {
		breakpoints: [
			{ minWidth: 1024, cols: 3, spacing: 'md' },
			{ minWidth: 768, cols: 2, spacing: 'sm' },
			{ minWidth: 640, cols: 1, spacing: 'sm' }
		],

		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(features);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let { description, icon, title } = each_array[i];

				Paper($$renderer, {
					shadow: 'xl',
					style: 'height: 100%',
					children: ($$renderer) => {
						Stack($$renderer, {
							children: ($$renderer) => {
								Center($$renderer, {
									override: { jc: 'start', gap: '$10' },
									inline: true,
									children: ($$renderer) => {
										ThemeIcon($$renderer, {
											variant: 'gradient',
											size: 'xl',
											children: ($$renderer) => {
												if (icon) {
													$$renderer.push('<!--[-->');
													icon($$renderer, { size: 25 });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Title($$renderer, {
											order: 3,
											weight: 'extrabold',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(title)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									size: 'lg',
									override: { lineHeight: '$md' },
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(description)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}