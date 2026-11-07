import * as $ from 'svelte/internal/server';

import {
	AddEquation,
	CustomBlending,
	Group,
	LessEqualDepth,
	Material,
	OneFactor
} from 'three';

import { T } from '@threlte/core';
import { useGltf, useDraco, useTexture } from '@threlte/extras';

export default function Spaceship($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			fallback,
			error,
			children,
			ref = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

		const dracoLoader = useDraco();
		const gltf = useGltf('/spaceship-tutorial/models/spaceship-transformed.glb', { dracoLoader });
		const map = useTexture('/spaceship-tutorial/textures/energy-beam-opacity.png');

		function alphaFix(material) {
			material.transparent = true;
			material.alphaToCoverage = true;
			material.depthFunc = LessEqualDepth;
			material.depthTest = true;
			material.depthWrite = true;
		}

		gltf.then((model) => {
			alphaFix(model.materials.spaceship_racer);
			alphaFix(model.materials.cockpit);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, $.spread_props([
					{ dispose: false },
					props,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$.await(
								$$renderer,
								gltf,
								() => {
									fallback?.($$renderer);
									$$renderer.push(`<!---->`);
								},
								(gltf) => {
									if (T.Group) {
										$$renderer.push('<!--[-->');

										T.Group($$renderer, {
											scale: 0.003,
											rotation: [0, -Math.PI * 0.5, 0],
											position: [0.95, 0, 0],
											children: ($$renderer) => {
												if (T.Mesh) {
													$$renderer.push('<!--[-->');

													T.Mesh($$renderer, {
														castShadow: true,
														receiveShadow: true,
														geometry: gltf.nodes.Cube001_spaceship_racer_0.geometry,
														material: gltf.materials.spaceship_racer
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
														castShadow: true,
														receiveShadow: true,
														geometry: gltf.nodes.Cube005_cockpit_0.geometry,
														material: gltf.materials.cockpit
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												$.await($$renderer, map, () => {}, (mapValue) => {
													if (T.Mesh) {
														$$renderer.push('<!--[-->');

														T.Mesh($$renderer, {
															position: [0, 0, -1350],
															'rotation.x': Math.PI * 0.5,
															children: ($$renderer) => {
																if (T.CylinderGeometry) {
																	$$renderer.push('<!--[-->');
																	T.CylinderGeometry($$renderer, { args: [70, 25, 1600, 15] });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (T.MeshBasicMaterial) {
																	$$renderer.push('<!--[-->');

																	T.MeshBasicMaterial($$renderer, {
																		color: [1.0, 0.4, 0.02],
																		alphaMap: mapValue,
																		transparent: true,
																		blending: CustomBlending,
																		blendDst: OneFactor,
																		blendEquation: AddEquation
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
												});

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
							);

							$$renderer.push(`<!--]--> `);
							children?.($$renderer, { ref });
							$$renderer.push(`<!---->`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}