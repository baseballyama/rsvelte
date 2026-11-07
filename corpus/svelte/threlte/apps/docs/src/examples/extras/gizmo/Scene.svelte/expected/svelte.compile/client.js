import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Grid } from '@threlte/extras';
import { BufferAttribute } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const red = [1, 0, 0];
	const green = [0, 1, 0];
	const blue = [0, 0, 1];

	const colors = new Float32Array([
		...red,
		...red,
		...red,
		...red,
		...red,
		...red,
		...red,
		...red,
		...green,
		...green,
		...green,
		...green,
		...green,
		...green,
		...green,
		...green,
		...blue,
		...blue,
		...blue,
		...blue,
		...blue,
		...blue,
		...blue,
		...blue
	]);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.AxesHelper, ($$anchor, T_AxesHelper) => {
		T_AxesHelper($$anchor, { args: [5], renderOrder: 1 });
	});

	var node_1 = $.sibling(node, 2);

	Grid(node_1, { sectionSize: 0, cellColor: '#eee' });

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get position() {
				return $$props.center;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, {
						oncreate: (ref) => {
							ref.setAttribute('color', new BufferAttribute(colors, 3));
						}
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, { vertexColors: true });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}