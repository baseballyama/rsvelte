import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls, Grid, Float } from '@threlte/extras';
import Diamond from './Diamond.svelte';

export default function Scene($$renderer) {
	Float($$renderer, {
		floatIntensity: 5,
		rotationIntensity: 1,
		rotationSpeed: [0, 0, 0],
		children: ($$renderer) => {
			Diamond($$renderer, { scale: 3, 'position.y': 2 });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			'position.y': 7,
			'position.z': -8,
			fov: 90,
			children: ($$renderer) => {
				OrbitControls($$renderer, {
					enableDamping: true,
					autoRotate: true,
					enablePan: false,
					enableZoom: false
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	Grid($$renderer, {
		cellColor: '#46536b',
		sectionThickness: 0,
		infiniteGrid: true,
		cellSize: 5
	});

	$$renderer.push(`<!---->`);
}