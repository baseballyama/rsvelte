import * as $ from 'svelte/internal/server';
import { Flex, Box } from '$lib/index.js';
import Plane from '../../Plane.svelte';

export default function Threlte($$renderer) {
	Plane($$renderer, { width: 500, height: 500, color: 'red' });
	$$renderer.push(`<!----> `);

	Flex($$renderer, {
		width: 500,
		height: 500,
		justifyContent: 'Center',
		alignItems: 'Center',
		gap: 20,
		children: ($$renderer) => {
			Box($$renderer, {
				children: ($$renderer) => {
					Plane($$renderer, { color: 'yellow', width: 100, height: 100, depth: 1 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Box($$renderer, {
				children: ($$renderer) => {
					Plane($$renderer, { color: 'blue', width: 100, height: 100, depth: 1 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}