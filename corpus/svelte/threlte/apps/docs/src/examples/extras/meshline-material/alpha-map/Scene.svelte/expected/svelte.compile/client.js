import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

import {
	Grid,
	MeshLineGeometry,
	MeshLineMaterial,
	OrbitControls,
	useTexture
} from '@threlte/extras';

import { CubicBezierCurve3, DoubleSide, Vector3 } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const texture = useTexture('/brush-texture.png');

	// create a smooth bezier curve
	const curve = new CubicBezierCurve3(new Vector3(-5, 0, 0), new Vector3(-5, 7, 0), new Vector3(5, 7, 0), new Vector3(5, 0, 0));

	// convert curve to an array of 100 points
	const points = curve.getPoints(100);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'rotation.z': -0.1,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				MeshLineGeometry(node_1, {
					get points() {
						return points;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				$.await(node_2, () => texture, null, ($$anchor, alphaMap) => {
					MeshLineMaterial($$anchor, {
						width: 1,
						color: '#fe3d00',
						transparent: true,
						depthTest: false,
						get alphaMap() {
							return $.get(alphaMap);
						}
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	$.await(node_3, () => texture, null, ($$anchor, map) => {
		var fragment_3 = $.comment();
		var node_4 = $.first_child(fragment_3);

		$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
			T_Mesh_1($$anchor, {
				'position.y': 2,
				scale: 2,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_5 = $.first_child(fragment_4);

					$.component(node_5, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
						T_PlaneGeometry($$anchor, {});
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
						T_MeshBasicMaterial($$anchor, {
							get map() {
								return $.get(map);
							},

							get side() {
								return DoubleSide;
							}
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_3);
	});

	var node_7 = $.sibling(node_3, 2);

	$.component(node_7, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			oncreate: (ref) => {
				ref.position.set(0, 3, 10);
			},

			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { autoRotateSpeed: 2, enableDamping: true, 'target.y': 2 });
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_7, 2);

	Grid(node_8, {
		gridSize: [10, 10],
		cellColor: '#46536b',
		sectionThickness: 0
	});

	$.append($$anchor, fragment);
	$.pop();
}