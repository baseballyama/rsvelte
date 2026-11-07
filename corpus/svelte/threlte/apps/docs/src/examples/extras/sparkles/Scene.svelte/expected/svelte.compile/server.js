import * as $ from 'svelte/internal/server';
import Sphere from './Sphere.svelte';
import { T } from '@threlte/core';
import { Environment, OrbitControls } from '@threlte/extras';

export default function Scene($$renderer) {
	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [0, 5, 12],
			fov: 30,
			children: ($$renderer) => {
				OrbitControls($$renderer, {
					enableDamping: true,
					autoRotateSpeed: 0.85,
					zoomSpeed: 0.75,
					minPolarAngle: Math.PI / 2.5,
					maxPolarAngle: Math.PI / 2.55
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

	Environment($$renderer, {
		url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/evening_road_01_2k.hdr',
		isBackground: false
	});

	$$renderer.push(`<!----> `);

	if (T.GridHelper) {
		$$renderer.push('<!--[-->');
		T.GridHelper($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	Sphere($$renderer, {
		color: 'white',
		amount: 50,
		emissive: 'green',
		position: [1, 1, -1]
	});

	$$renderer.push(`<!----> `);

	Sphere($$renderer, {
		color: 'white',
		amount: 30,
		emissive: 'purple',
		position: [-1.5, 0.5, -2],
		size: 0.5
	});

	$$renderer.push(`<!----> `);

	Sphere($$renderer, {
		color: 'lightpink',
		amount: 20,
		emissive: 'orange',
		position: [-1, 0.25, 1],
		size: 0.25
	});

	$$renderer.push(`<!---->`);
}