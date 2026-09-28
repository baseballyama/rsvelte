import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Align, OrbitControls, PointsMaterial } from '@threlte/extras';
import { BufferAttribute, BufferGeometry } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const size = 30;
		const count = size ** 3;
		const positions = new Float32Array(count * 3);

		// 3D math squiggles
		for (let i = 0; i < count; i++) {
			// 1D to 3D array
			let x = i / (size * size);

			let y = i / size % size;
			let z = i % size;
			const vx = Math.sin(Math.abs(size - x) * 0.1) * Math.sin(Math.abs(size - y) * 0.1) * 10 + Math.random() * 0.1;
			const vy = Math.sin(Math.abs(size - x) * 0.3) * Math.sin(Math.abs(size - y) * 0.3) * 10 + Math.random() * 0.1;
			const vz = y + Math.random() * 0.01 * z;

			//x
			positions[i * 3 + 0] = vx;

			//y
			positions[i * 3 + 1] = vy;

			//z
			positions[i * 3 + 2] = vz;
		}

		const geometry = new BufferGeometry();

		geometry.setAttribute('position', new BufferAttribute(positions, 3));

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
							T($$renderer, { is: geometry });
							$$renderer.push(`<!----> `);
							PointsMaterial($$renderer, { size: 0.25 });
							$$renderer.push(`<!---->`);
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