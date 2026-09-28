import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

import {
	Wobble,
	Environment,
	Instance,
	InstancedMesh,
	OrbitControls,
	RadialGradientTexture,
	useGltf,
	SoftShadows,
	Wireframe
} from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			subject = 'plant',
			speed = 1,
			factor = 0.5,
			frequency = 1,
			noise = 0,
			pulse = 0,
			drift = 0,
			bendiness = 0,
			axis = [0, 1, 0],
			anchor,
			forceDirection,
			time
		} = $$props;

		const plantGltf = useGltf('/models/rhyzome_plant-baked.glb');
		const flowerGltf = useGltf('/models/Flower.glb');

		// Scattered flower placements.
		const flowerPlacements = Array.from({ length: 20 }, (_, i) => {
			const angle = i / 10 * Math.PI * 2 + Math.random() * 0.4;
			const radius = 0.3 + Math.random();

			return {
				x: Math.cos(angle) * radius,
				z: Math.sin(angle) * radius,
				scale: 2 + Math.random() * 1.5,
				rotation: Math.random() * Math.PI * 2
			};
		});

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { makeDefault: true, position: [0, 7, 7], fov: 35 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		OrbitControls($$renderer, { enableDamping: true, enableZoom: false, 'target.y': 1.7 });
		$$renderer.push(`<!----> `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');

			T.DirectionalLight($$renderer, {
				position: [1, 5, 1],
				intensity: 4,
				castShadow: true,
				'shadow.mapSize.width': 1024,
				'shadow.mapSize.height': 1024,
				'shadow.camera.left': -4,
				'shadow.camera.right': 4,
				'shadow.camera.top': 4,
				'shadow.camera.bottom': -4,
				'shadow.camera.near': 0.5,
				'shadow.camera.far': 20
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/industrial_sunset_puresky_1k.hdr'
		});

		$$renderer.push(`<!----> `);
		SoftShadows($$renderer, { size: 10, samples: 10, focus: 1.5 });
		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'rotation.x': -Math.PI / 2,
				receiveShadow: true,
				children: ($$renderer) => {
					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [6, 64] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');

						T.MeshStandardMaterial($$renderer, {
							transparent: true,
							roughness: 0,
							children: ($$renderer) => {
								RadialGradientTexture($$renderer, {
									outerRadius: 256,
									stops: [
										{ offset: 0, color: 'white' },
										{ offset: 0.7, color: 'rgba(255, 255, 255, 0)' }
									]
								});
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

		$$renderer.push(` `);

		if (subject === 'plant' && $.store_get($$store_subs ??= {}, '$plantGltf', plantGltf)) {
			$$renderer.push('<!--[0-->');

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					castShadow: true,
					receiveShadow: true,
					children: ($$renderer) => {
						T($$renderer, {
							is: $.store_get($$store_subs ??= {}, '$plantGltf', plantGltf).nodes.concrete_pot_lambert3_0.geometry
						});

						$$renderer.push(`<!----> `);

						T($$renderer, {
							is: $.store_get($$store_subs ??= {}, '$plantGltf', plantGltf).materials.lambert3
						});

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
					castShadow: true,
					receiveShadow: true,
					children: ($$renderer) => {
						T($$renderer, {
							is: $.store_get($$store_subs ??= {}, '$plantGltf', plantGltf).nodes.plant_lambert2_0.geometry
						});

						$$renderer.push(`<!----> `);

						T($$renderer, {
							is: $.store_get($$store_subs ??= {}, '$plantGltf', plantGltf).materials.lambert2,
							roughness: 0.4
						});

						$$renderer.push(`<!----> `);

						Wobble($$renderer, {
							speed,
							factor,
							frequency,
							noise,
							pulse,
							drift,
							bendiness,
							axis,
							anchor,
							forceDirection,
							time
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (subject === 'orb') {
			$$renderer.push('<!--[1-->');

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'position.y': 1.5,
					castShadow: true,
					receiveShadow: true,
					children: ($$renderer) => {
						if (T.SphereGeometry) {
							$$renderer.push('<!--[-->');
							T.SphereGeometry($$renderer, { args: [1, 32, 32] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { color: '#ff7755', roughness: 0.1 });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						Wobble($$renderer, {
							speed,
							factor,
							frequency,
							noise,
							pulse,
							drift,
							bendiness,
							axis,
							anchor,
							forceDirection,
							time
						});

						$$renderer.push(`<!----> `);
						Wireframe($$renderer, {});
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (subject === 'flowers' && $.store_get($$store_subs ??= {}, '$flowerGltf', flowerGltf)) {
			$$renderer.push('<!--[2-->');

			InstancedMesh($$renderer, {
				castShadow: true,
				receiveShadow: true,
				limit: flowerPlacements.length,
				children: ($$renderer) => {
					T($$renderer, {
						is: $.store_get($$store_subs ??= {}, '$flowerGltf', flowerGltf).nodes.Stem.geometry
					});

					$$renderer.push(`<!----> `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#3d7a3a' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Wobble($$renderer, {
						speed,
						factor,
						frequency,
						noise,
						pulse,
						drift,
						bendiness,
						axis,
						anchor,
						forceDirection,
						time
					});

					$$renderer.push(`<!----> <!--[-->`);

					const each_array = $.ensure_array_like(flowerPlacements);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let f = each_array[$$index];

						Instance($$renderer, {
							'position.x': f.x,
							'position.z': f.z,
							scale: f.scale,
							'rotation.y': f.rotation
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			InstancedMesh($$renderer, {
				castShadow: true,
				receiveShadow: true,
				limit: flowerPlacements.length,
				children: ($$renderer) => {
					T($$renderer, {
						is: $.store_get($$store_subs ??= {}, '$flowerGltf', flowerGltf).nodes.Blossom.geometry
					});

					$$renderer.push(`<!----> `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#ff5599' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Wobble($$renderer, {
						speed,
						factor,
						frequency,
						noise,
						pulse,
						drift,
						bendiness,
						axis,
						anchor,
						forceDirection,
						time
					});

					$$renderer.push(`<!----> <!--[-->`);

					const each_array_1 = $.ensure_array_like(flowerPlacements);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let f = each_array_1[$$index_1];

						Instance($$renderer, {
							'position.x': f.x,
							'position.z': f.z,
							scale: f.scale,
							'rotation.y': f.rotation
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}