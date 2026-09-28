import * as $ from 'svelte/internal/server';

import {
	OrbitControls,
	Grid,
	useGltf,
	Environment,
	Wireframe,
	bvh,
	interactivity
} from '@threlte/extras';

import { T, useTask } from '@threlte/core';
import { BufferAttribute, DynamicDrawUsage, Mesh, Vector3 } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { $$slots, $$events, ...rest } = $$props;
		const { raycaster } = interactivity();

		raycaster.firstHitOnly = true;
		bvh(() => rest);

		const gltf = useGltf('/models/stanford_bunny.glb');

		const mesh = $.derived(() => $.store_get($$store_subs ??= {}, '$gltf', gltf)
			? $.store_get($$store_subs ??= {}, '$gltf', gltf).nodes['Object_2']
			: undefined);

		const faces = new Set();

		useTask(() => {
			const attribute = mesh()?.geometry.getAttribute('color');

			if (!attribute) {
				return;
			}

			for (const face of faces) {
				let gb = attribute.getY(face.a);

				gb += 0.01;

				if (gb >= 1) {
					gb = 1;
					faces.delete(face);
				}

				attribute.setXYZ(face.a, 1, gb, gb);
				attribute.setXYZ(face.b, 1, gb, gb);
				attribute.setXYZ(face.c, 1, gb, gb);
				attribute.needsUpdate = true;
			}
		});

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				'position.x': -1.3,
				'position.y': 1.8,
				'position.z': 1.8,
				fov: 50,
				oncreate: (ref) => ref.lookAt(0, 0.6, 0),
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						enableDamping: true,
						enableZoom: false,
						enablePan: false,
						target: [0, 0.6, 0]
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if ($.store_get($$store_subs ??= {}, '$gltf', gltf)) {
			$$renderer.push('<!--[0-->');

			T($$renderer, {
				is: $.store_get($$store_subs ??= {}, '$gltf', gltf).nodes['Object_2'],
				scale: 10,
				'rotation.x': -Math.PI / 2,
				'position.y': -0.35,
				onpointermove: ({ face }) => {
					const attribute = mesh()?.geometry.getAttribute('color');

					if (face && attribute) {
						attribute.setXYZ(face.a, 1, 0, 0);
						attribute.setXYZ(face.b, 1, 0, 0);
						attribute.setXYZ(face.c, 1, 0, 0);
						faces.add(face);
					}
				},

				children: ($$renderer) => {
					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { roughness: 0.1, metalness: 0.4, vertexColors: true });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Wireframe($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
		});

		$$renderer.push(`<!----> `);

		Grid($$renderer, {
			sectionThickness: 1,
			infiniteGrid: true,
			cellColor: '#dddddd',
			sectionColor: '#ffffff',
			sectionSize: 1,
			cellSize: 0.5,
			type: 'circular',
			fadeOrigin: new Vector3(),
			fadeDistance: 20,
			fadeStrength: 10
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}