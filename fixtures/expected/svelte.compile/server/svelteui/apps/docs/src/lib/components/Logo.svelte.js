import * as $ from 'svelte/internal/server';
import { Badge, Center, Title, Box } from '@svelteuidev/core';
import { base } from '$app/paths';

export default function Logo($$renderer) {
	const override = { gap: '0.5rem' };
	const title = { fontFamily: 'var(--font)' };

	$$renderer.push(`<a${$.attr('href', `${$.stringify(base)}/`)} class="logoEl svelte-gpyk3a">`);

	Center($$renderer, {
		override,
		inline: true,
		children: ($$renderer) => {
			Box($$renderer, {
				css: { d: 'flex' },
				children: ($$renderer) => {
					Title($$renderer, {
						override: title,
						order: 2,
						inline: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Svelte`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Title($$renderer, {
						override: title,
						order: 2,
						inline: true,
						color: 'blue',
						children: ($$renderer) => {
							$$renderer.push(`<!---->UI`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				override: { display: 'inline-block' },
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Beta`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></a>`);
}