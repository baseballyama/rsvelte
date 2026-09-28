import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OrbitControls } from '@threlte/extras';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	let autoRotate = $.prop($$props, 'autoRotate', 3, true);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: 5 });
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.z': 5,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					get autoRotate() {
						return autoRotate();
					}
				});
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => T.MeshNormalMaterial, ($$anchor, T_MeshNormalMaterial) => {
					T_MeshNormalMaterial($$anchor, {});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
					T_TorusKnotGeometry($$anchor, {});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}