import * as $ from 'svelte/internal/server';
import { OrbitControls, useGltf, bvh, interactivity, PointsMaterial } from '@threlte/extras';
import { T, useTask } from '@threlte/core';
import { BufferAttribute, DynamicDrawUsage, Points } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { $$slots, $$events, ...rest } = $$props;
		const { raycaster } = interactivity();

		raycaster.params.Points.threshold = 0.5;
		bvh(() => rest);

		const gltf = useGltf('/models/stairs.glb');

		const points = $.derived(() => {
			if (!$.store_get($$store_subs ??= {}, '$gltf', gltf)) {
				return;
			}

			const results = $.store_get($$store_subs ??= {}, '$gltf', gltf).nodes['Object'];
			const array = new Float32Array(3 * results.geometry.getAttribute('position').count).fill(1);
			const attribute = new BufferAttribute(array, 3).setUsage(DynamicDrawUsage);

			results.geometry.setAttribute('color', attribute);

			return results;
		});

		useTask(() => {
			if (!points()) return;

			const attribute = points().geometry.getAttribute('color');
			const indices = points().userData.indices;

			if (indices.size > 0) {
				for (const index of indices) {
					let gb = attribute.getY(index);

					gb += 0.005;

					if (gb >= 1) {
						gb = 1;
						indices.delete(index);
					}

					attribute.setXYZ(index, 1, gb, gb);
				}

				attribute.needsUpdate = true;
			}
		});

		let visible = false;
		let point = [0, 0, 0];

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				'position.x': 20,
				'position.y': 20,
				'position.z': -20,
				fov: 50,
				children: ($$renderer) => {
					OrbitControls($$renderer, { enableDamping: true, enableZoom: false, enablePan: false });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (points()) {
			$$renderer.push('<!--[0-->');

			T($$renderer, {
				is: points(),
				'rotation.x': -Math.PI / 2,
				'userData.indices': new Set(),
				onpointerenter: () => {
					visible = true;
				},

				onpointerleave: () => {
					visible = false;
				},

				onpointermove: (event) => {
					point = event.point.toArray();

					if (event.index) {
						points().geometry.getAttribute('color').setXYZ(event.index, 1, 0, 0);
						points().userData.indices.add(event.index);
					}
				},

				children: ($$renderer) => {
					PointsMaterial($$renderer, {
						size: 0.2,
						vertexColors: true,
						transparent: true,
						toneMapped: false,
						opacity: 0.75
					});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				position: point,
				renderOrder: 1,
				visible,
				bvh: { enabled: false },
				children: ($$renderer) => {
					if (T.SphereGeometry) {
						$$renderer.push('<!--[-->');
						T.SphereGeometry($$renderer, { args: [0.5] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');

						T.MeshBasicMaterial($$renderer, {
							color: 'red',
							depthTest: false,
							transparent: true,
							opacity: 0.5
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

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}