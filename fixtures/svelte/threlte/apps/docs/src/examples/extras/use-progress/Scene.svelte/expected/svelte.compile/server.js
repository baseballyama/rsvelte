import * as $ from 'svelte/internal/server';
import { Environment, useGltf } from '@threlte/extras';
import { T, useTask } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let rotation = 0;

		useTask((delta) => {
			const f = 1 / 60 / delta; // ~1 at 60fps

			rotation += 0.01 * f;
		});

		const gltf = useGltf('/models/helmet/DamagedHelmet.gltf?v=' + Math.random().toString() // force a reload on every pageload
		);

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
		});

		$$renderer.push(`<!----> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { makeDefault: true, 'position.z': 10, fov: 20 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { 'position.y': 10, 'position.z': 10 });
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
					$.await($$renderer, gltf, () => {}, ({ nodes }) => {
						T($$renderer, { is: nodes['node_damagedHelmet_-6514'] });
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
	});
}