import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { teleportControls } from '$lib/index.js';

export default function Teleport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		teleportControls('left');
		teleportControls('right');

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				teleportSurface: true,
				receiveShadow: true,
				'position.y': -0.01,
				'rotation.x': -90 * (Math.PI / 180),
				children: ($$renderer) => {
					if (T.PlaneGeometry) {
						$$renderer.push('<!--[-->');
						T.PlaneGeometry($$renderer, { args: [10, 10] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, {});
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
}