import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Attractor } from '@threlte/rapier';
import RandomMeshes from './RandomMeshes.svelte';

export default function BasicScene($$renderer, $$props) {
	let { strengthLeft, strengthCenter, strengthRight } = $$props;
	let count = 50;

	const reset = () => {
		count = 0;
		setTimeout(() => count = 50);
	};

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			'position.y': 50,
			'position.z': 100,
			fov: 70,
			far: 10000,
			oncreate: (ref) => ref.lookAt(0, 20, 0),
			children: ($$renderer) => {
				OrbitControls($$renderer, { 'target.y': 20, enableZoom: false, enableDamping: true });
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
		T.DirectionalLight($$renderer, { castShadow: true, position: [8, 20, -3] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.GridHelper) {
		$$renderer.push('<!--[-->');
		T.GridHelper($$renderer, { args: [100] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	RandomMeshes($$renderer, { count, rangeX: [-30, 30], rangeY: [0, 75], rangeZ: [-10, 10] });
	$$renderer.push(`<!----> `);
	Attractor($$renderer, { range: 20, strength: strengthLeft, position: [-25, 10, 0] });
	$$renderer.push(`<!----> `);
	Attractor($$renderer, { range: 15, strength: strengthCenter, position: [0, 20, 0] });
	$$renderer.push(`<!----> `);
	Attractor($$renderer, { range: 20, strength: strengthRight, position: [25, 10, 0] });
	$$renderer.push(`<!---->`);
	$.bind_props($$props, { reset });
}