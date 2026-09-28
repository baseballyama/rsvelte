import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, Grid, Stars } from '@threlte/extras';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var fragment = root();
	var node = $.first_child(fragment);

	Stars(node, $.spread_props(() => rest));

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.y': 1,
			'position.x': 2,
			'position.z': 5,
			fov: 90,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					enableDamping: true,
					enablePan: false,
					enableZoom: false,
					autoRotate: true,
					autoRotateSpeed: 0.3
				});
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	Grid(node_2, {
		infiniteGrid: true,
		fadeOrigin: [0, 0, 0],
		fadeDistance: 10,
		cellColor: '#dddddd',
		sectionColor: '#ddd'
	});

	$.append($$anchor, fragment);
}