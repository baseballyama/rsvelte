import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Align, OrbitControls } from '@threlte/extras';
import { BufferGeometry, Vector3 } from 'three';

export default function SceneAlternative($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const size = 30;
		const count = size ** 3;
		const vectorPositions = [];

		// 3D math squiggles
		for (let i = 0; i < count; i++) {
			// 1D to 3D array
			let x = i / (size * size);

			let y = i / size % size;
			let z = i % size;
			const vx = Math.sin(Math.abs(size - x) * 0.1) * Math.sin(Math.abs(size - y) * 0.1) * 10 + Math.random() * 0.1;
			const vy = Math.sin(Math.abs(size - x) * 0.3) * Math.sin(Math.abs(size - y) * 0.3) * 10 + Math.random() * 0.1;
			const vz = y + Math.random() * 0.01 * z;

			vectorPositions.push(new Vector3(vx, vy, vz));
		}

		const pointsBufferGeometry = new BufferGeometry().setFromPoints(vectorPositions);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [50, 50, 50],
				fov: 15,
				children: ($$renderer) => {
					OrbitControls($$renderer, { autoRotate: true });
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
			T.DirectionalLight($$renderer, { 'position.y': 10, 'position.z': 10 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Align($$renderer, {
			children: ($$renderer) => {
				if (T.Points) {
					$$renderer.push('<!--[-->');

					T.Points($$renderer, {
						children: ($$renderer) => {
							T($$renderer, { is: pointsBufferGeometry });
							$$renderer.push(`<!----> `);

							if (T.PointsMaterial) {
								$$renderer.push('<!--[-->');
								T.PointsMaterial($$renderer, { size: 0.25 });
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

		$$renderer.push(`<!---->`);
	});
}