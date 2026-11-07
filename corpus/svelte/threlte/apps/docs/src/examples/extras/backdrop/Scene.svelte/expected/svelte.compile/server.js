import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';

import {
	BackdropGeometry,
	Bounds,
	Environment,
	Gizmo,
	OrbitControls,
	TransformControls
} from '@threlte/extras';

import { useGltf } from '@threlte/extras';
import { isInstanceOf, T, useThrelte } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			materialColor = 'white',
			materialWireframe = false,
			length,
			segments
		} = $$props;

		const gltf = useGltf('/models/Duck.glb').then((gltf) => {
			gltf.nodes.LOD3spShape.castShadow = true;

			return gltf;
		});

		const { scene } = useThrelte();
		let helper = void 0;
		let light = void 0;
		let debug = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Environment($$renderer, {
				url: '/textures/equirectangular/hdr/blouberg_sunrise_2_1k.hdr'
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { ref }) {
					if (debug) {
						$$renderer.push('<!--[0-->');

						if (T.DirectionalLightHelper) {
							$$renderer.push('<!--[-->');

							T.DirectionalLightHelper($$renderer, {
								args: [ref],
								attach: scene,
								get ref() {
									return helper;
								},

								set ref($$value) {
									helper = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.CameraHelper) {
							$$renderer.push('<!--[-->');
							T.CameraHelper($$renderer, { args: [ref.shadow.camera] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				if (T.DirectionalLight) {
					$$renderer.push('<!--[-->');

					T.DirectionalLight($$renderer, {
						'position.x': 2,
						'position.y': 0.5,
						'position.z': 10,
						intensity: 2,
						castShadow: true,
						'shadow.camera.left': -10,
						'shadow.camera.right': 10,
						'shadow.camera.top': -10,
						'shadow.camera.bottom': 10,
						'shadow.bias': -0.001,
						get ref() {
							return light;
						},

						set ref($$value) {
							light = $$value;
							$$settled = false;
						},
						children,
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(` `);

			TransformControls($$renderer, {
				mode: 'scale',
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							receiveShadow: true,
							scale: 20,
							'position.z': -5,
							children: ($$renderer) => {
								BackdropGeometry($$renderer, { length, segments });
								$$renderer.push(`<!----> `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');

									T.MeshStandardMaterial($$renderer, {
										color: materialColor,
										wireframe: materialWireframe,
										receiveShadow: true,
										roughness: 0.4,
										metalness: 0.1
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
			});

			$$renderer.push(`<!----> `);

			$.await($$renderer, gltf, () => {}, ({ scene }) => {
				Bounds($$renderer, {
					margin: 0.5,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like({ length: 3 });

						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							if (T.Group) {
								$$renderer.push('<!--[-->');

								T.Group($$renderer, {
									scale: 2,
									'position.z': Math.cos(index * MathUtils.degToRad(120)) * 4,
									'position.x': Math.sin(index * MathUtils.degToRad(120)) * 4,
									'position.y': -0,
									'rotation.y': Math.PI,
									oncreate: (ref) => {
										ref.lookAt(0, -0.2, 0);
									},

									children: ($$renderer) => {
										T($$renderer, {
											is: scene.clone(),
											'rotation.y': -Math.PI / 2,
											oncreate: (ref) => {
												ref.traverse((child) => {
													child.castShadow = true;
													child.receiveShadow = true;
													console.log(child);

													if (isInstanceOf(child, 'Mesh')) {
														const material = child.material;

														if (isInstanceOf(material, 'MeshStandardMaterial')) {
															material.roughness = 0.1;
														}
													}
												});
											}
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			});

			$$renderer.push(`<!--]--> `);

			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					'position.x': -30,
					'position.y': 5,
					'position.z': 10,
					children: ($$renderer) => {
						OrbitControls($$renderer, {
							enableDamping: true,
							maxPolarAngle: 0.5 * Math.PI,
							minAzimuthAngle: -1 * 0.25 * Math.PI,
							maxAzimuthAngle: 0.25 * Math.PI,
							children: ($$renderer) => {
								Gizmo($$renderer, {});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

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
	});
}