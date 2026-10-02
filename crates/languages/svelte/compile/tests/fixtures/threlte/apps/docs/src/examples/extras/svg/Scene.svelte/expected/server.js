import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { SVG, OrbitControls } from '@threlte/extras';
import url from './ordering.svg?url';

export default function Scene($$renderer, $$props) {
	let { selection } = $$props;

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			'position.z': 5,
			'position.y': 1,
			children: ($$renderer) => {
				OrbitControls($$renderer, { autoRotate: true, enablePan: false, enableZoom: false });
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (selection == 0) {
		$$renderer.push('<!--[0-->');

		SVG($$renderer, {
			src: '/icons/svelte.svg',
			scale: 0.005,
			'position.x': -1.2,
			'position.y': 1.5
		});
	} else {
		$$renderer.push('<!--[-1-->');

		SVG($$renderer, {
			src: url,
			scale: 0.005,
			'position.x': -1.2,
			'position.y': 1.5
		});
	}

	$$renderer.push(`<!--]-->`);
}