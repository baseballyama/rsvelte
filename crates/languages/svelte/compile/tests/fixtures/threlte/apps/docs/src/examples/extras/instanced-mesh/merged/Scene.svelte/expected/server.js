import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { InstancedMeshes, OrbitControls, Sky, useGltf } from '@threlte/extras';
import { DoubleSide, Mesh, MathUtils, Vector3 } from 'three';
import Flower from './Flower.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const gltf = useGltf('/models/Flower.glb');
		const vec3 = new Vector3();

		const items = Array.from({ length: 500 }, () => {
			vec3.randomDirection().multiplyScalar(2.5);

			return {
				x: vec3.x,
				z: vec3.z,
				scale: Math.random() * 0.5 + 0.5,
				rotation: {
					x: Math.random() * 8,
					y: Math.random() * 360,
					z: Math.random() * 8
				}
			};
		});

		if ($.store_get($$store_subs ??= {}, '$gltf', gltf)) {
			$$renderer.push('<!--[0-->');

			{
				function children($$renderer, { components: { Blossom, Stem } }) {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						Flower($$renderer, {
							'position.x': item.x,
							'position.z': item.z,
							scale: item.scale,
							'rotation.y': item.rotation.y * MathUtils.DEG2RAD,
							'rotation.x': item.rotation.x * MathUtils.DEG2RAD,
							'rotation.z': item.rotation.z * MathUtils.DEG2RAD,
							children: ($$renderer) => {
								if (Blossom) {
									$$renderer.push('<!--[-->');
									Blossom($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Stem) {
									$$renderer.push('<!--[-->');
									Stem($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				}

				InstancedMeshes($$renderer, {
					castShadow: true,
					meshes: $.store_get($$store_subs ??= {}, '$gltf', gltf).nodes,
					oncreate: () => {
						$.store_get($$store_subs ??= {}, '$gltf', gltf).scene.traverse((child) => {
							child.castShadow = true;
							child.receiveShadow = true;
						});
					},
					children,
					$$slots: { default: true }
				});
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');

			T.DirectionalLight($$renderer, {
				'position.y': 3,
				'position.z': -15,
				castShadow: true,
				'shadow.camera.left': -2.5,
				'shadow.camera.right': 2.5,
				'shadow.camera.top': 2.5,
				'shadow.camera.bottom': -2.5,
				'shadow.mapSize.width': 2 ** 11,
				'shadow.mapSize.height': 2 ** 11
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
				'rotation.x': -90 * MathUtils.DEG2RAD,
				children: ($$renderer) => {
					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [2.5] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#288278', side: DoubleSide });
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
		Sky($$renderer, { elevation: 2 });
		$$renderer.push(`<!----> `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.5 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				position: [0.5, 0.8, 6.2],
				makeDefault: true,
				fov: 20,
				oncreate: (ref) => ref.lookAt(0, 0.7, 0),
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						autoRotate: true,
						enableZoom: false,
						enableDamping: true,
						autoRotateSpeed: 0.1,
						enablePan: false,
						target: [0, 0.7, 0]
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}