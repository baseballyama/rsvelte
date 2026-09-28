import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Edges, useGltf } from '@threlte/extras';
import { Mesh, MeshStandardMaterial, MathUtils } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let rotation = 0;

		useTask((delta) => {
			rotation += delta;
		});

		const gltf = useGltf('/models/helmet/DamagedHelmet.gltf');
		const helmetGeometry = $.derived(() => $.store_get($$store_subs ??= {}, '$gltf', gltf)?.nodes['node_damagedHelmet_-6514'].geometry);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { makeDefault: true, 'position.z': 10, fov: 20 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'rotation.y': rotation,
				children: ($$renderer) => {
					if (helmetGeometry()) {
						$$renderer.push('<!--[0-->');

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								'rotation.x': 90 * MathUtils.DEG2RAD,
								geometry: helmetGeometry(),
								children: ($$renderer) => {
									if (T.MeshBasicMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshBasicMaterial($$renderer, { color: 0xff3e00, toneMapped: false });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);
									Edges($$renderer, { thresholdAngle: 20, color: 'white', scale: 1.01 });
									$$renderer.push(`<!---->`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}