import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { interactivity } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	let rotation = 0;

	useTask((delta) => {
		rotation += delta;
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			name: 'Camera',
			makeDefault: true,
			position: [0, 1, 8.9958],
			fov: 33.25
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			intensity: 1,
			position: [-8.8163, 15.0192, 0],
			castShadow: true,
			'shadow.camera.top': 2.5,
			'shadow.camera.bottom': -2.5,
			'shadow.camera.left': -2.5,
			'shadow.camera.right': 2.5
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.2 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			name: 'Floor',
			rotation: [-1.5708, 0, 0],
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_4 = $.first_child(fragment_1);

				$.component(node_4, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [3, 64] });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#e9e9e9' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_3, 2);

	$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			name: 'Box',
			scale: [1.5, 1.5, 1.5],
			position: [0, 0.75, -1.6],
			castShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_7 = $.first_child(fragment_2);

				$.component(node_7, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, {});
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, { color: '#0059BA' });
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node_6, 2);

	$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_2) => {
		T_Mesh_2($$anchor, {
			name: 'Torus',
			position: [1.2, 0.8556, 0.75],
			castShadow: true,
			rotation: [1.8326, 0, 0],
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_10 = $.first_child(fragment_3);

				$.component(node_10, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
					T_TorusKnotGeometry($$anchor, { args: [0.5, 0.15, 100, 12, 2, 3] });
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
					T_MeshStandardMaterial_2($$anchor, { color: '#F85122', roughness: 0.4348 });
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_12 = $.sibling(node_9, 2);

	$.component(node_12, () => T.Mesh, ($$anchor, T_Mesh_3) => {
		T_Mesh_3($$anchor, {
			name: 'Icosahedron',
			position: [-1.4, 0.8494, 0.75],
			castShadow: true,
			visible: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_13 = $.first_child(fragment_4);

				$.component(node_13, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
					T_IcosahedronGeometry($$anchor, {});
				});

				var node_14 = $.sibling(node_13, 2);

				$.component(node_14, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_3) => {
					T_MeshStandardMaterial_3($$anchor, { color: '#F8EBCE' });
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}