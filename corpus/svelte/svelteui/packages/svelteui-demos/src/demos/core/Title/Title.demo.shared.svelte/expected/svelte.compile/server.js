import * as $ from 'svelte/internal/server';
import { Title } from '@svelteuidev/core';

const code = `<script>
	import { Title } from '@svelteuidev/core';
<\/script>


<Title order={1}>This is h1 title</Title>
<Title order={1} variant='gradient' gradient={{from: 'blue', to: 'red', deg: 45}}>This is h1 title with a twist</Title>`;

export const type = 'demo';
export const configuration = { code };

export default function Title_demo_shared($$renderer) {
	Title($$renderer, {
		order: 1,
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is h1 title`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Title($$renderer, {
		order: 1,
		variant: 'gradient',
		gradient: { from: 'blue', to: 'red', deg: 45 },
		children: ($$renderer) => {
			$$renderer.push(`<!---->This is h1 title with a twist`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}