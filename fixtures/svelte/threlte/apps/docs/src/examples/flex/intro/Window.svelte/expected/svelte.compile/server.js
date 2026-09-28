import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { RoundedBoxGeometry } from '@threlte/extras';
import { Box, Flex, tailwindParser } from '@threlte/flex';
import Circle from './Circle.svelte';
import Label from './Label.svelte';

export default function Window($$renderer, $$props) {
	let { title, width = 500, height = 400, children: innerChildren } = $$props;

	Flex($$renderer, {
		classParser: tailwindParser,
		width,
		height,
		class: 'flex-col gap-1 p-1',
		children: ($$renderer) => {
			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					children: ($$renderer) => {
						RoundedBoxGeometry($$renderer, { args: [width, height, 20], radius: 6 });
						$$renderer.push(`<!----> `);

						if (T.MeshBasicMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshBasicMaterial($$renderer, { color: '#0A0F19' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			{
				function children($$renderer, { height, width }) {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'position.z': 20,
							children: ($$renderer) => {
								RoundedBoxGeometry($$renderer, { args: [width, height, 20], radius: 5 });
								$$renderer.push(`<!----> `);

								if (T.MeshBasicMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshBasicMaterial($$renderer, { color: '#ddd' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Box($$renderer, {
						class: 'h-10 w-10',
						children: ($$renderer) => {
							Circle($$renderer, { radius: 5, color: '#FF6057', z: 30.01 });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Box($$renderer, {
						class: 'h-10 w-10',
						children: ($$renderer) => {
							Circle($$renderer, { radius: 5, color: '#FDBD2E', z: 30.01 });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Box($$renderer, {
						class: 'h-10 w-10',
						children: ($$renderer) => {
							Circle($$renderer, { radius: 5, color: '#27C840', z: 30.01 });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Box($$renderer, {
						class: 'h-full w-auto flex-1 items-center justify-center',
						children: ($$renderer) => {
							Label($$renderer, {
								text: title,
								z: 30.01,
								fontStyle: 'semi-bold',
								fontSize: 'l',
								color: '#454649'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				Box($$renderer, {
					class: 'h-26 w-full items-center justify-start gap-5 pr-53 pl-8',
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { width, height }) {
					innerChildren?.($$renderer, { width, height });
					$$renderer.push(`<!---->`);
				}

				Box($$renderer, {
					class: 'h-auto w-auto flex-1',
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}