import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { interactivity } from '@threlte/extras';
import { Spring } from 'svelte/motion';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	const scale = new Spring(1);
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [10, 10, 10],
			oncreate: (ref) => {
				ref.lookAt(0, 1, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 1,
			get scale() {
				return scale.current;
			},

			onpointerenter: () => {
				scale.target = 1.5;
			},

			onpointerleave: () => {
				scale.target = 1;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { args: [1, 2, 1] });
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, { color: 'hotpink' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}