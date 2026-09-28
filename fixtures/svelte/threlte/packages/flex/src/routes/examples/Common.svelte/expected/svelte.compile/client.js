import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);

export default function Common($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			makeDefault: true,
			near: 100,
			far: 10000,
			position: [0, 0, 5000],
			oncreate: (ref) => ref.lookAt(0, 0, 0),
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { zoomToCursor: true });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {});
	});

	$.append($$anchor, fragment);
}