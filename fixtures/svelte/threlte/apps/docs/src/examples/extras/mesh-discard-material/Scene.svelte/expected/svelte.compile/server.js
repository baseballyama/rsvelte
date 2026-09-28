import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { BakeShadows, MeshDiscardMaterial, OrbitControls } from '@threlte/extras';
import { MeshStandardMaterial, SphereGeometry } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const geometry = new SphereGeometry();
		const material = new MeshStandardMaterial({ color: 'orangered' });

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [5, 7, 5],
				children: ($$renderer) => {
					OrbitControls($$renderer, {});
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
			T.DirectionalLight($$renderer, { position: [0, 5, 5], castShadow: true });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');
			T.Mesh($$renderer, { geometry, material, 'position.x': -2, castShadow: true });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');
			T.Mesh($$renderer, { geometry, material, castShadow: true, visible: false });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				geometry,
				position: 2,
				castShadow: true,
				children: ($$renderer) => {
					MeshDiscardMaterial($$renderer, {});
				},
				$$slots: { default: true }
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
				'rotation.x': -1 * 0.5 * Math.PI,
				'position.y': -1 * 1.25,
				children: ($$renderer) => {
					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [5] });
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
		BakeShadows($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}