import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Attractor } from '@threlte/rapier';
import RandomMeshes from './RandomMeshes.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function BasicScene($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(50);

	const reset = () => {
		$.set(count, 0);
		setTimeout(() => $.set(count, 50));
	};

	var $$exports = { reset };
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.y': 50,
			'position.z': 100,
			fov: 70,
			far: 10000,
			oncreate: (ref) => ref.lookAt(0, 20, 0),
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { 'target.y': 20, enableZoom: false, enableDamping: true });
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
		T_GridHelper($$anchor, { args: [100] });
	});

	var node_3 = $.sibling(node_2, 2);

	RandomMeshes(node_3, {
		get count() {
			return $.get(count);
		},
		rangeX: [-30, 30],
		rangeY: [0, 75],
		rangeZ: [-10, 10]
	});

	var node_4 = $.sibling(node_3, 2);

	Attractor(node_4, {
		range: 20,
		get strength() {
			return $$props.strengthLeft;
		},
		position: [-25, 10, 0]
	});

	var node_5 = $.sibling(node_4, 2);

	Attractor(node_5, {
		range: 15,
		get strength() {
			return $$props.strengthCenter;
		},
		position: [0, 20, 0]
	});

	var node_6 = $.sibling(node_5, 2);

	Attractor(node_6, {
		range: 20,
		get strength() {
			return $$props.strengthRight;
		},
		position: [25, 10, 0]
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}