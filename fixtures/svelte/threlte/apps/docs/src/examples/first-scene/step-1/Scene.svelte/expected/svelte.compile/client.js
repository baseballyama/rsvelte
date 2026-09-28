import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, {});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}