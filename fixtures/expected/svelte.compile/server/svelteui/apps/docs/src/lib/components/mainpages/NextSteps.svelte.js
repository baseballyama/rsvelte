import * as $ from 'svelte/internal/server';
import { Group, ThemeIcon, Text, SimpleGrid, Anchor } from '@svelteuidev/core';
import { NEXT_STEPS_DATA } from '$lib/data';

export default function NextSteps($$renderer) {
	// @ts-nocheck
	const styles = {
		focusRing: 'auto',
		display: 'block',
		padding: '$xlPX',
		borderRadius: '$md',
		border: `1px solid $gray300`,
		backgroundColor: 'white',
		color: 'black',
		transition: 'box-shadow 200ms ease, transform 100ms ease',
		'&:hover': {
			transform: 'scale(1.01)',
			boxShadow: '$md',
			textDecoration: 'none'
		}
	};

	SimpleGrid($$renderer, {
		cols: 2,
		breakpoints: [{ maxWidth: 800, cols: 1 }],
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(NEXT_STEPS_DATA);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				Anchor($$renderer, {
					root: 'a',
					href: item.link,
					override: styles,
					underline: false,
					class: 'next_steps',
					children: ($$renderer) => {
						Group($$renderer, {
							children: ($$renderer) => {
								ThemeIcon($$renderer, {
									size: 34,
									override: { backgroundColor: `${item.color} !important` },
									children: ($$renderer) => {
										if (item.icon) {
											$$renderer.push('<!--[-->');
											item.icon($$renderer, { size: 20 });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									weight: 500,
									size: 'lg',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.title)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							size: 'sm',
							color: 'dimmed',
							override: { lineHeight: 1.6, mt: 16 },
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(item.description)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}