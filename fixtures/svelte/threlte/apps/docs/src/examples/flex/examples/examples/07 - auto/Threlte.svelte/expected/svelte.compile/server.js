import * as $ from 'svelte/internal/server';
import { Flex, Box } from '@threlte/flex';
import Plane from '../../Plane.svelte';

export default function Threlte($$renderer) {
	Plane($$renderer, { width: 300, height: 300, color: 'red' });
	$$renderer.push(`<!----> `);

	Flex($$renderer, {
		width: 300,
		height: 300,
		justifyContent: 'Center',
		alignItems: 'Stretch',
		gap: 20,
		padding: 20,
		children: ($$renderer) => {
			{
				function children($$renderer, { width, height }) {
					Plane($$renderer, { color: 'yellow', width, height, depth: 1 });
				}

				Box($$renderer, {
					width: 'auto',
					height: 'auto',
					flex: 1,
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
					width: 'auto',
					height: 200,
					flex: 0.5,
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