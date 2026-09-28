import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { interactivity } from '@threlte/extras';
import { Spring } from 'svelte/motion';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	const scale = new Spring(1);
	let rotation = $.state(0);

	useTask((delta) => {
		$.set(rotation, $.get(rotation) + delta);
	});

	var fragment = root_1();
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

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [0, 10, 10] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get 'rotation.y'() {
				return $.get(rotation);
			},
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
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { args: [1, 2, 1] });
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'hotpink' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}