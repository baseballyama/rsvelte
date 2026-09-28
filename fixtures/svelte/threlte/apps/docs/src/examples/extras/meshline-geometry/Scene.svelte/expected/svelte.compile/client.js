import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Grid, MeshLineGeometry, MeshLineMaterial, OrbitControls } from '@threlte/extras';
import { CatmullRomCurve3, Vector3 } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let shape = $.prop($$props, 'shape', 3, 'taper'),
		color = $.prop($$props, 'color', 3, '#fe3d00'),
		width = $.prop($$props, 'width', 3, 1);

	// create a smooth curve from 4 points
	const curve = new CatmullRomCurve3([
		new Vector3(-3, 0, 0),
		new Vector3(-1, 1, -1),
		new Vector3(1, -1, 1),
		new Vector3(3, 0, 0)
	]);

	// convert curve to an array of 100 points
	const points = curve.getPoints(100);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 3,
			scale: 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				MeshLineGeometry(node_1, {
					get points() {
						return points;
					},

					get shape() {
						return shape();
					}
				});

				var node_2 = $.sibling(node_1, 2);

				MeshLineMaterial(node_2, {
					get color() {
						return color();
					},

					get width() {
						return width();
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			oncreate: (ref) => {
				ref.position.set(10, 3, 10);
			},

			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					autoRotate: true,
					autoRotateSpeed: 2,
					enableDamping: true,
					enableZoom: false,
					'target.y': 2
				});
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_3, 2);

	Grid(node_4, {
		gridSize: [10, 10],
		cellColor: '#46536b',
		sectionThickness: 0
	});

	$.append($$anchor, fragment);
	$.pop();
}