import * as $ from 'svelte/internal/server';
import { Seo, Text } from '@svelteuidev/core';

const code = `
<script>
    import { Seo } from '@svelteuidev/core';
<\/script>

<Seo
    title='Seo Demo'
    titleTemplate="%t% | SvelteUI"
 />
`;

export const type = 'demo';
export const configuration = { code };

export default function Seo_demo_usage($$renderer) {
	Text($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Look at the webpage title`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Seo($$renderer, { title: 'Seo Demo', titleTemplate: '%t% | SvelteUI' });
	$$renderer.push(`<!---->`);
}