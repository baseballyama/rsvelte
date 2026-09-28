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
					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { width, height }) {
							Plane($$renderer, { color: 'pink', width, height, depth: 2 });
						}

						Box($$renderer, {
							flex: 1,
							width: 'auto',
							height: 44,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { width, height }) {
							Plane($$renderer, { color: 'hotpink', width, height, depth: 2 });
						}

						Box($$renderer, {
							flex: 1,
							width: 'auto',
							height: 44,
							alignSelf: 'FlexEnd',
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!---->`);
				}

				Box($$renderer, {
					width: 'auto',
					height: 'auto',
					flex: 0.5,
					alignItems: 'Stretch',
					padding: 20,
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