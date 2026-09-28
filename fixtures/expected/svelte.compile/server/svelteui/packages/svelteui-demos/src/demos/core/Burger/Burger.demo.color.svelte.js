import * as $ from 'svelte/internal/server';
import { Burger, Center, SimpleGrid } from '@svelteuidev/core';

const code = `
<script>
	import { Burger } from '@svelteuidev/core';
<\/script>

<Burger />
<Burger color="#fe6734" />
<Burger color="#45f50d" />`;

export const type = 'demo';
export const configuration = { code };

export default function Burger_demo_color($$renderer) {
	let opened = [];

	Center($$renderer, {
		children: ($$renderer) => {
			SimpleGrid($$renderer, {
				cols: 3,
				override: { alignItems: 'center' },
				children: ($$renderer) => {
					Burger($$renderer, { opened: opened[0] });
					$$renderer.push(`<!----> `);
					Burger($$renderer, { color: '#fe6734', opened: opened[1] });
					$$renderer.push(`<!----> `);
					Burger($$renderer, { color: '#45f50d', opened: opened[2] });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}