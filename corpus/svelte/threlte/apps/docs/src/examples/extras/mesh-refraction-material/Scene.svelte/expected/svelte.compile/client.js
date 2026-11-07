import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, Grid, Float } from '@threlte/extras';
import Diamond from './Diamond.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Float(node, {
		floatIntensity: 5,
		rotationIntensity: 1,
		rotationSpeed: [0, 0, 0],
		children: ($$anchor, $$slotProps) => {
			Diamond($$anchor, { scale: 3, 'position.y': 2 });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.y': 7,
			'position.z': -8,
			fov: 90,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					enableDamping: true,
					autoRotate: true,
					enablePan: false,
					enableZoom: false
				});
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	Grid(node_2, {
		cellColor: '#46536b',
		sectionThickness: 0,
		infiniteGrid: true,
		cellSize: 5
	});

	$.append($$anchor, fragment);
}