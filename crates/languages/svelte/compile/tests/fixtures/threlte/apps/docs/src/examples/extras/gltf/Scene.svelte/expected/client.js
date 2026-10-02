import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Environment, GLTF, OrbitControls } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Environment(node, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [5, 2, 5],
			fov: 25,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { autoRotate: true, enableDamping: true, enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_3 = $.sibling(node_2, 2);

	GLTF(node_3, { url: '/models/helmet/DamagedHelmet.gltf' });
	$.append($$anchor, fragment);
}