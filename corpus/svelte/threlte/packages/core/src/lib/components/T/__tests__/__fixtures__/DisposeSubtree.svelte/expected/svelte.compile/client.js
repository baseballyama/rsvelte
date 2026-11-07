import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function DisposeSubtree($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			dispose: false,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { name: 'no-dispose-geo' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, { name: 'no-dispose-mat' });
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						dispose: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
								T_BoxGeometry_1($$anchor, { name: 'dispose-geo' });
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
								T_MeshBasicMaterial_1($$anchor, { name: 'dispose-mat' });
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}