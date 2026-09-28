import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Debug } from '@threlte/rapier';
import AttachedCollider from './AttachedCollider.svelte';
import Sensor from './Sensor.svelte';
import StandaloneCollider from './StandaloneCollider.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	const tests = [StandaloneCollider, AttachedCollider, Sensor];
	const SvelteComponent = $.derived(() => tests[$$props.testIndex]);
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			'position.x': 12,
			'position.y': 13,
			fov: 40,
			makeDefault: true,
			oncreate: (ref) => ref.lookAt(2.5, 0, 0),
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { 'target.x': 2.5 });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true, position: [8, 20, -3] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [50] });
	});

	var node_3 = $.sibling(node_2, 2);

	Debug(node_3, { depthTest: false, depthWrite: false });

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_1) => {
		SvelteComponent_1($$anchor, {});
	});

	$.append($$anchor, fragment);
}