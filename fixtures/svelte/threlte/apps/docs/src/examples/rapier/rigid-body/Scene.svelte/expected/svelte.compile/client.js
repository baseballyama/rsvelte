import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, AudioListener } from '@threlte/extras';
import { Debug } from '@threlte/rapier';
import Emitter from './Emitter.svelte';
import Ground from './Ground.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [10, 10, 10],
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				OrbitControls(node_1, { enableZoom: false });

				var node_2 = $.sibling(node_1, 2);

				AudioListener(node_2, {});
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true, position: [8, 20, -3] });
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [50] });
	});

	var node_5 = $.sibling(node_4, 2);

	Ground(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	Debug(node_6, {});

	var node_7 = $.sibling(node_6, 2);

	Emitter(node_7, {});
	$.append($$anchor, fragment);
}