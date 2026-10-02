import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls, Grid, Stars } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	let { $$slots, $$events, ...rest } = $$props;

	Stars($$renderer, $.spread_props([rest]));
	$$renderer.push(`<!----> `);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			'position.y': 1,
			'position.x': 2,
			'position.z': 5,
			fov: 90,
			children: ($$renderer) => {
				OrbitControls($$renderer, {
					enableDamping: true,
					enablePan: false,
					enableZoom: false,
					autoRotate: true,
					autoRotateSpeed: 0.3
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
		infiniteGrid: true,
		fadeOrigin: [0, 0, 0],
		fadeDistance: 10,
		cellColor: '#dddddd',
		sectionColor: '#ddd'
	});

	$$renderer.push(`<!---->`);
}