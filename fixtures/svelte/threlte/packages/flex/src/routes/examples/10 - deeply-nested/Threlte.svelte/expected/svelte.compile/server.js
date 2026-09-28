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
		padding: 20,
		children: ($$renderer) => {
			{
				function children($$renderer, { width, height }) {
					Plane($$renderer, { color: 'yellow', width, height, depth: 1 });
					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { width, height }) {
							Plane($$renderer, { color: 'fuchsia', width, height, depth: 2 });
						}

						Box($$renderer, {
							flex: 1,
							width: 'auto',
							height: 'auto',
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { width, height }) {
							Plane($$renderer, { color: 'orange', width, height, depth: 2 });
							$$renderer.push(`<!----> `);

							{
								function children($$renderer, { width, height }) {
									Plane($$renderer, { color: 'red', width, height, depth: 3 });
								}

								Box($$renderer, {
									width: 100,
									height: 100,
									children,
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!---->`);
						}

						Box($$renderer, {
							flex: 1,
							width: 'auto',
							height: 'auto',
							justifyContent: 'Center',
							alignItems: 'Center',
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!---->`);
				}

				Box($$renderer, {
					width: 'auto',
					height: 'auto',
					flex: 1,
					gap: 20,
					padding: 20,
					flexDirection: 'Column',
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
							height: 100,
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
							height: 100,
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