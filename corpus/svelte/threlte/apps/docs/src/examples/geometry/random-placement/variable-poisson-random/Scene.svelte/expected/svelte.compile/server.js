import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { width, height } from './stores';
import Random from './Random.svelte';

export default function Scene($$renderer, $$props) {
	let { regen } = $$props;

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [20, 20, 20],
			children: ($$renderer) => {
				OrbitControls($$renderer, { maxPolarAngle: 1.56 });
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

		T.DirectionalLight($$renderer, {
			position: [6, 13, 10],
			castShadow: true,
			'shadow.camera.top': 12,
			'shadow.camera.left': -12,
			'shadow.camera.right': 12,
			'shadow.camera.bottom': -12
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.AmbientLight) {
		$$renderer.push('<!--[-->');
		T.AmbientLight($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			'rotation.x': -Math.PI / 2,
			receiveShadow: true,
			children: ($$renderer) => {
				if (T.PlaneGeometry) {
					$$renderer.push('<!--[-->');
					T.PlaneGeometry($$renderer, { args: [width, height, 1, 1] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, { color: 'green' });
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

	$$renderer.push(` <!---->`);

	{
		Random($$renderer, {});
	}

	$$renderer.push(`<!---->`);
}