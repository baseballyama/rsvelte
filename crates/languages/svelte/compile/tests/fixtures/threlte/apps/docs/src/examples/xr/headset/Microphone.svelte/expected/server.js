import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Edges } from '@threlte/extras';

export default function Microphone($$renderer, $$props) {
	let { $$slots, $$events, ...rest } = $$props;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, $.spread_props([
			rest,
			{
				children: ($$renderer) => {
					const size = 0.005;
					const length = size * 14;

					if (T.CylinderGeometry) {
						$$renderer.push('<!--[-->');
						T.CylinderGeometry($$renderer, { args: [size, size, length] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#eedbcb' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black', scale: 1.001, thresholdAngle: 20 });
					$$renderer.push(`<!----> `);

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							position: [size * 4, -length, 0],
							'rotation.z': Math.PI / 5,
							children: ($$renderer) => {
								if (T.CylinderGeometry) {
									$$renderer.push('<!--[-->');
									T.CylinderGeometry($$renderer, { args: [size, size, length] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: '#eedbcb' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								Edges($$renderer, { color: 'black', scale: 1.001, thresholdAngle: 20 });
								$$renderer.push(`<!----> `);

								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										position: [0, -size * 8, 0],
										'rotation.z': Math.PI / 4,
										children: ($$renderer) => {
											if (T.IcosahedronGeometry) {
												$$renderer.push('<!--[-->');
												T.IcosahedronGeometry($$renderer, { args: [size * 3, 2] });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');
												T.MeshStandardMaterial($$renderer, { color: 'gray' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);
											Edges($$renderer, { color: 'black', scale: 1.001, thresholdAngle: 20 });
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

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
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}