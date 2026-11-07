import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import Scenery from './Random.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [20, 20, 20],
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { maxPolarAngle: 1.56 });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			position: [3, 10, 7],
			castShadow: true,
			'shadow.camera.top': 10,
			'shadow.camera.left': -10,
			'shadow.camera.right': 10,
			'shadow.camera.bottom': -10
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'rotation.x': -Math.PI / 2,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, { args: [20, 20, 1, 1] });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'green' });
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_3, 2);

	$.key(node_6, () => $$props.regen, ($$anchor) => {
		Scenery($$anchor, {
			get numObjects() {
				return $$props.numObjects;
			}
		});
	});

	$.append($$anchor, fragment);
}