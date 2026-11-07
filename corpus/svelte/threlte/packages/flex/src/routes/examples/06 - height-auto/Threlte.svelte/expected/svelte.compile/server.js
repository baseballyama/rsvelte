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
		alignItems: 'Stretch',
		gap: 20,
		children: ($$renderer) => {
			{
				function children($$renderer, { width, height }) {
					Plane($$renderer, { color: 'yellow', width, height, depth: 1 });
				}

				Box($$renderer, {
					width: 100,
					height: 'auto',
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { width, height }) {
					Plane($$renderer, { color: 'blue', width, height, depth: 1 });
				}

				Box($$renderer, {
					width: 100,
					height: 'auto',
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}