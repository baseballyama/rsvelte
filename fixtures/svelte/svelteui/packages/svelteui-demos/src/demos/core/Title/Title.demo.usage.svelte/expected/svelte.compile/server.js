import * as $ from 'svelte/internal/server';
import { Title } from '@svelteuidev/core';

const code = `<script>
	import { Title } from '@svelteuidev/core';
<\/script>

<Title order={1}>This is h1 title</Title>
<Title order={2}>This is h2 title</Title>
<Title order={3}>This is h3 title</Title>
<Title order={4}>This is h4 title</Title>
<Title order={5}>This is h5 title</Title>
<Title order={6}>This is h6 title</Title>`;

export const type = 'demo';
export const configuration = { code };

export default function Title_demo_usage($$renderer) {
	Title($$renderer, {
		order: 1,
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is h1 title`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Title($$renderer, {
		order: 2,
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is h2 title`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Title($$renderer, {
		order: 3,
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is h3 title`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Title($$renderer, {
		order: 4,
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is h4 title`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Title($$renderer, {
		order: 5,
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is h5 title`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Title($$renderer, {
		order: 6,
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is h6 title`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}