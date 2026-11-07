import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { teleportControls } from '$lib/index.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Teleport($$anchor, $$props) {
	$.push($$props, true);
	teleportControls('left');
	teleportControls('right');

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			teleportSurface: true,
			receiveShadow: true,
			'position.y': -0.01,
			'rotation.x': -90 * (Math.PI / 180),
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, { args: [10, 10] });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}