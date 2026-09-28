import * as $ from 'svelte/internal/server';
import { Group, Loader } from '@svelteuidev/core';

const code = `<script>
    import { Loader } from '@svelteuidev/core';
<\/script>

<Loader variant='circle' />
<Loader variant='dots' />
<Loader variant='bars' />`;

export const type = 'demo';
export const configuration = { code };

export default function Loader_demo_variants($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Loader($$renderer, { variant: 'circle' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { variant: 'dots' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { variant: 'bars' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}