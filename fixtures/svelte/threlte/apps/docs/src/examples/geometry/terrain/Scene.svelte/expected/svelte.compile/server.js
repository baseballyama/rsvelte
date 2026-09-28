import * as $ from 'svelte/internal/server';
import { Environment, OrbitControls } from '@threlte/extras';
import { DoubleSide, PlaneGeometry } from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';
import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { autoRotate = false, flatness = 4 } = $$props;
		const geometry = new PlaneGeometry(10, 10, 100, 100);
		const positions = geometry.getAttribute('position');
		const noise = new SimplexNoise();

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: 10,
				children: ($$renderer) => {
					OrbitControls($$renderer, { autoRotate, autoRotateSpeed: 0.5 });
				},
				$$slots: { default: true }
			});

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

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				geometry,
				'rotation.x': -1 * 0.5 * Math.PI,
				children: ($$renderer) => {
					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { side: DoubleSide });
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