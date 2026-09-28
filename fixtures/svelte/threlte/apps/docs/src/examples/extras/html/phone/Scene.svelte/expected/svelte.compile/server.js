import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Environment, Float, HTML, useGltf, OrbitControls } from '@threlte/extras';
import { MathUtils } from 'three';
import Geometries from './Geometries.svelte';
import { RoundedPlaneGeometry } from './RoundedPlaneGeometry';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const gltf = useGltf('/models/phone/phone.glb');
		const phoneGeometry = $.derived(() => $.store_get($$store_subs ??= {}, '$gltf', gltf)?.nodes.phone.geometry);
		const url = window.origin;

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				position: [50, -30, 30],
				fov: 20,
				oncreate: (ref) => {
					ref.lookAt(0, 0, 0);
				},
				makeDefault: true,
				children: ($$renderer) => {
					OrbitControls($$renderer, { enableDamping: true, enableZoom: false });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.3 });
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

		Float($$renderer, {
			scale: 0.7,
			floatIntensity: 5,
			children: ($$renderer) => {
				HTML($$renderer, {
					'rotation.y': 90 * MathUtils.DEG2RAD,
					'position.x': 1.2,
					transform: true,
					occlude: 'blending',
					geometry: new RoundedPlaneGeometry(10.5, 21.3, 1.6),
					children: ($$renderer) => {
						$$renderer.push(`<div class="phone-wrapper svelte-t1fkn5" style="border-radius:1rem"><iframe title=""${$.attr('src', url)} width="100%" height="100%" frameborder="0"></iframe></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (phoneGeometry()) {
					$$renderer.push('<!--[0-->');

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							scale: 5.65,
							geometry: phoneGeometry(),
							children: ($$renderer) => {
								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: '#FF3F00', metalness: 0.9, roughness: 0.1 });
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

		$$renderer.push(`<!----> `);
		Geometries($$renderer, {});
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}