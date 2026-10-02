import * as $ from 'svelte/internal/server';
import { Group, Loader } from '@svelteuidev/core';

const code = `<script>
    import { Loader } from '@svelteuidev/core';
<\/script>

<Loader color='red' />
<Loader color='green' />
<Loader color='teal' />
<Loader color='gray' />
<Loader color='blue' />
<Loader color='yellow' />`;

export const type = 'demo';
export const configuration = { code };

export default function Loader_demo_colors($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Loader($$renderer, { color: 'red' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'green' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'teal' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'gray' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'blue' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { color: 'yellow' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}