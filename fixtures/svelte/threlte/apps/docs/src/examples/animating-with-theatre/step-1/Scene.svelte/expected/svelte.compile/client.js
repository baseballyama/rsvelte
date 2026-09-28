import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [5, 5, 5],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [3, 10, 7] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.4 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 0.5,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_4 = $.first_child(fragment_1);

				$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, {});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#ff3e00' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_3, 2);

	$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			'rotation.x': -Math.PI / 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_7 = $.first_child(fragment_2);

				$.component(node_7, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [4, 48] });
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, { color: 'white' });
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}