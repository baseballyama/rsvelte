import * as $ from 'svelte/internal/server';
import { Group, Loader } from '@svelteuidev/core';

const code = `<script>
    import { Loader } from '@svelteuidev/core';
<\/script>

<Loader size='lg' />
<Loader size={50} />`;

export const type = 'demo';
export const configuration = { code };

export default function Loader_demo_size($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Loader($$renderer, { size: 'lg' });
			$$renderer.push(`<!----> `);
			Loader($$renderer, { size: 50 });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}