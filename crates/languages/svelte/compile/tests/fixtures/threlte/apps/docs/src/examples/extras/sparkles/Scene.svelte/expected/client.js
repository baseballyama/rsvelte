import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sphere from './Sphere.svelte';
import { T } from '@threlte/core';
import { Environment, OrbitControls } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 5, 12],
			fov: 30,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					enableDamping: true,
					autoRotateSpeed: 0.85,
					zoomSpeed: 0.75,
					minPolarAngle: Math.PI / 2.5,
					maxPolarAngle: Math.PI / 2.55
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Environment(node_1, {
		url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/evening_road_01_2k.hdr',
		isBackground: false
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, {});
	});

	var node_3 = $.sibling(node_2, 2);

	Sphere(node_3, {
		color: 'white',
		amount: 50,
		emissive: 'green',
		position: [1, 1, -1]
	});

	var node_4 = $.sibling(node_3, 2);

	Sphere(node_4, {
		color: 'white',
		amount: 30,
		emissive: 'purple',
		position: [-1.5, 0.5, -2],
		size: 0.5
	});

	var node_5 = $.sibling(node_4, 2);

	Sphere(node_5, {
		color: 'lightpink',
		amount: 20,
		emissive: 'orange',
		position: [-1, 0.25, 1],
		size: 0.25
	});

	$.append($$anchor, fragment);
}