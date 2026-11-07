import * as $ from 'svelte/internal/server';
import { Flex, Box, tailwindParser } from '@threlte/flex';
import Plane from '../../Plane.svelte';

export default function Threlte($$renderer) {
	Plane($$renderer, { width: 300, height: 300, color: 'red' });
	$$renderer.push(`<!----> `);

	Flex($$renderer, {
		width: 300,
		height: 300,
		classParser: tailwindParser,
		class: 'gap-10 p-10',
		children: ($$renderer) => {
			{
				function children($$renderer, { width, height }) {
					Plane($$renderer, { width, height, color: 'yellow', depth: 1 });
				}

				Box($$renderer, { class: 'h-44 w-44', children, $$slots: { default: true } });
			}

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { width }) {
					Plane($$renderer, { color: 'blue', width, height: 44, depth: 1 });
				}

				Box($$renderer, { class: 'flex-1', children, $$slots: { default: true } });
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}