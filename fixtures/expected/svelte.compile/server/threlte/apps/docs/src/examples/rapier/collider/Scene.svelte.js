import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Debug } from '@threlte/rapier';
import AttachedCollider from './AttachedCollider.svelte';
import Sensor from './Sensor.svelte';
import StandaloneCollider from './StandaloneCollider.svelte';

export default function Scene($$renderer, $$props) {
	let { testIndex } = $$props;
	const tests = [StandaloneCollider, AttachedCollider, Sensor];
	const SvelteComponent = $.derived(() => tests[testIndex]);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			'position.x': 12,
			'position.y': 13,
			fov: 40,
			makeDefault: true,
			oncreate: (ref) => ref.lookAt(2.5, 0, 0),
			children: ($$renderer) => {
				OrbitControls($$renderer, { 'target.x': 2.5 });
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
		T.GridHelper($$renderer, { args: [50] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);
	Debug($$renderer, { depthTest: false, depthWrite: false });
	$$renderer.push(`<!----> `);

	if (SvelteComponent()) {
		$$renderer.push('<!--[-->');
		SvelteComponent()($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}