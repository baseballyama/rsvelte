import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Edges } from '@threlte/extras';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Microphone($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, $.spread_props(() => rest, {
			children: ($$anchor, $$slotProps) => {
				const size = $.derived(() => 0.005);
				const length = $.derived(() => $.get(size) * 14);
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
					T_CylinderGeometry($$anchor, { args: [$.get(size), $.get(size), $.get(length)] });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#eedbcb' });
				});

				var node_3 = $.sibling(node_2, 2);

				Edges(node_3, { color: 'black', scale: 1.001, thresholdAngle: 20 });

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						position: [$.get(size) * 4, -$.get(length), 0],
						'rotation.z': Math.PI / 5,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry_1) => {
								T_CylinderGeometry_1($$anchor, { args: [$.get(size), $.get(size), $.get(length)] });
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
								T_MeshStandardMaterial_1($$anchor, { color: '#eedbcb' });
							});

							var node_7 = $.sibling(node_6, 2);

							Edges(node_7, { color: 'black', scale: 1.001, thresholdAngle: 20 });

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_2) => {
								T_Mesh_2($$anchor, {
									position: [0, -$.get(size) * 8, 0],
									'rotation.z': Math.PI / 4,
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_9 = $.first_child(fragment_3);

										$.component(node_9, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
											T_IcosahedronGeometry($$anchor, { args: [$.get(size) * 3, 2] });
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
											T_MeshStandardMaterial_2($$anchor, { color: 'gray' });
										});

										var node_11 = $.sibling(node_10, 2);

										Edges(node_11, { color: 'black', scale: 1.001, thresholdAngle: 20 });
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
}