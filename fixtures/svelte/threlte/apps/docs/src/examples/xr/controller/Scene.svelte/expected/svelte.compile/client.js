import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Fog, Color } from 'three';
import { T, useThrelte } from '@threlte/core';
import { XR } from '@threlte/xr';
import Controller from './Controller.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const { scene } = useThrelte();

	scene.fog = new Fog('black', 1.5, 2);
	scene.background = new Color('black');

	var fragment = root_1();
	var node = $.first_child(fragment);

	XR(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Controller(node_1, { left: true });

			var node_2 = $.sibling(node_1, 2);

			Controller(node_2, { right: true });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 1.5 });
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { intensity: 1.5 });
	});

	$.append($$anchor, fragment);
	$.pop();
}