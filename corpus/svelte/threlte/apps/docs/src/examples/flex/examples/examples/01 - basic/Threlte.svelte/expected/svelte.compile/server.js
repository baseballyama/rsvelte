import * as $ from 'svelte/internal/server';
import { Flex, Box } from '@threlte/flex';
import Plane from '../../Plane.svelte';

export default function Threlte($$renderer) {
	Plane($$renderer, { width: 300, height: 300, color: 'red' });
	$$renderer.push(`<!----> `);

	Flex($$renderer, {
		width: 300,
		height: 300,
		children: ($$renderer) => {
			Box($$renderer, {
				children: ($$renderer) => {
					Plane($$renderer, { color: 'yellow', width: 44, height: 44, depth: 1 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Box($$renderer, {
				children: ($$renderer) => {
					Plane($$renderer, { color: 'blue', width: 44, height: 44, depth: 1 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}