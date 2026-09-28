import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Mesh } from 'three';
import { T } from '@threlte/core';
import { Grid, CameraControls } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let controls = $.prop($$props, 'controls', 15),
		mesh = $.prop($$props, 'mesh', 15);

	var fragment = root_1();
	var node = $.first_child(fragment);

	CameraControls(node, {
		oncreate: (ref) => {
			ref.setPosition(5, 5, 5);
		},

		get ref() {
			return controls();
		},

		set ref($$value) {
			controls($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 0.5,
			get ref() {
				return mesh();
			},

			set ref($$value) {
				mesh($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, {});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, { color: '#ff3e00', wireframe: true });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_1, 2);

	Grid(node_4, {
		sectionColor: '#ff3e00',
		sectionThickness: 1,
		cellColor: '#cccccc',
		gridSize: 40
	});

	$.append($$anchor, fragment);
	$.pop();
}