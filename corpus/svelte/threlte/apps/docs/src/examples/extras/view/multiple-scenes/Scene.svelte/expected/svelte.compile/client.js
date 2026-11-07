import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask, useThrelte } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Color } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const { scene } = useThrelte();
	let rotation = $.state(0);

	scene.background = new Color(0xe0e0e0);

	useTask((delta) => {
		$.set(rotation, $.get(rotation) + delta);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 0, 2],
			fov: 50,
			near: 1,
			far: 10,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { minDistance: 2, maxDistance: 5, enablePan: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.HemisphereLight, ($$anchor, T_HemisphereLight) => {
		T_HemisphereLight($$anchor, { args: [0xaaaaaa, 0x444444, 3] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { args: [0xffffff, 1.5], position: [1, 1, 1] });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get 'rotation.y'() {
				return $.get(rotation);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_4 = $.first_child(fragment_2);

				T(node_4, {
					get is() {
						return $$props.geometry;
					}
				});

				var node_5 = $.sibling(node_4, 2);

				T(node_5, {
					get is() {
						return $$props.material;
					}
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}