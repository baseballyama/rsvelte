import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Edges, useGltf } from '@threlte/extras';

export default function Disc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { discSpeed = 0, $$slots, $$events, ...rest } = $$props;
		let discRotation = 0;

		useTask(
			(delta) => {
				discRotation += delta * discSpeed;
			},
			{ running: () => discSpeed > 0 }
		);

		const gltf = useGltf('/models/turntable/disc-logo.glb');
		const logoGeometry = $.derived(() => $.store_get($$store_subs ??= {}, '$gltf', gltf)?.nodes.Logo.geometry);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, $.spread_props([
				rest,
				{
					children: ($$renderer) => {
						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								'rotation.y': -discRotation,
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											receiveShadow: true,
											castShadow: true,
											'position.y': 0.1,
											children: ($$renderer) => {
												if (T.CylinderGeometry) {
													$$renderer.push('<!--[-->');
													T.CylinderGeometry($$renderer, { args: [1.85, 2, 0.2, 64] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { color: '#111111' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);
												Edges($$renderer, { color: 'black', thresholdAngle: 20 });
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											receiveShadow: true,
											castShadow: true,
											'position.y': 0.2 + 0.05,
											children: ($$renderer) => {
												if (T.CylinderGeometry) {
													$$renderer.push('<!--[-->');
													T.CylinderGeometry($$renderer, { args: [1.75, 1.75, 0.05, 64] });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.MeshStandardMaterial) {
													$$renderer.push('<!--[-->');
													T.MeshStandardMaterial($$renderer, { color: '#111111' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);
												Edges($$renderer, { thresholdAngle: 50, scale: 1, color: 'black' });
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											receiveShadow: true,
											castShadow: true,
											'position.y': 0.2 + 0.05 + 0.005,
											children: ($$renderer) => {
												if (T.CylinderGeometry) {
													$$renderer.push('<!--[-->');
													T.CylinderGeometry($$renderer, { args: [0.8, 0.8, 0.05, 64] });
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
												Edges($$renderer, { thresholdAngle: 50, scale: 1, color: 'black' });
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (logoGeometry()) {
										$$renderer.push('<!--[0-->');

										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												geometry: logoGeometry(),
												'position.y': 0.2 + 0.05 + 0.025 + 0.01,
												children: ($$renderer) => {
													if (T.MeshBasicMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshBasicMaterial($$renderer, { color: '#ff3e00', toneMapped: false });
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
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}