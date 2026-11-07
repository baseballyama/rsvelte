import * as $ from 'svelte/internal/server';
import { Burger, Center, SimpleGrid } from '@svelteuidev/core';

const code = `
<script>
	import { Burger } from '@svelteuidev/core';
<\/script>

<Burger size='xs' />
<Burger size='sm' />
<Burger size='md' />
<Burger size='lg' />
<Burger size='xl' />`;

export const type = 'demo';
export const configuration = { code };

export default function Burger_demo_size($$renderer) {
	let opened = [];

	Center($$renderer, {
		children: ($$renderer) => {
			SimpleGrid($$renderer, {
				cols: 5,
				override: { alignItems: 'center' },
				children: ($$renderer) => {
					Burger($$renderer, { size: 'xs', opened: opened[0] });
					$$renderer.push(`<!----> `);
					Burger($$renderer, { size: 'sm', opened: opened[1] });
					$$renderer.push(`<!----> `);
					Burger($$renderer, { size: 'md', opened: opened[2] });
					$$renderer.push(`<!----> `);
					Burger($$renderer, { size: 'lg', opened: opened[3] });
					$$renderer.push(`<!----> `);
					Burger($$renderer, { size: 'xl', opened: opened[4] });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}