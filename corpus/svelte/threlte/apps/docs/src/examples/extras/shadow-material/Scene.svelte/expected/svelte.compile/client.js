import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Mesh } from 'three';
import { OrbitControls, ShadowMaterial } from '@threlte/extras';
import { T, useTask } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, '#000000');
	const plane = new Mesh();
	const sphere = new Mesh();
	const radius = 1;
	const diameter = 2 * radius;
	const planeScale = 2 * diameter;

	plane.scale.x = planeScale;
	plane.scale.y = planeScale;

	let time = 0;
	const shadowMesh = new Mesh();

	useTask((dt) => {
		time += dt;

		const s = Math.sin(time);

		sphere.position.y = 2.5 + s;
		shadowMesh.scale.setScalar(3 + s);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.x': 5,
			'position.y': 5,
			'position.z': 5,
			oncreate: (ref) => {
				ref.lookAt(plane.position);
			},

			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	T(node_1, {
		get is() {
			return sphere;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
				T_IcosahedronGeometry($$anchor, { args: [radius, 2] });
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
				T_MeshBasicMaterial($$anchor, { color: 'orangered', wireframe: true });
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	$.component(node_4, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			'rotation.x': -1 * 0.5 * Math.PI,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_5 = $.first_child(fragment_3);

				T(node_5, {
					get is() {
						return plane;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_6 = $.first_child(fragment_4);

						$.component(node_6, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
							T_PlaneGeometry($$anchor, {});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_5, 2);

				T(node_7, {
					get is() {
						return shadowMesh;
					},
					'position.z': 0.01,
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_8 = $.first_child(fragment_5);

						$.component(node_8, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_1) => {
							T_PlaneGeometry_1($$anchor, {});
						});

						var node_9 = $.sibling(node_8, 2);

						ShadowMaterial(node_9, {
							get color() {
								return color();
							}
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}