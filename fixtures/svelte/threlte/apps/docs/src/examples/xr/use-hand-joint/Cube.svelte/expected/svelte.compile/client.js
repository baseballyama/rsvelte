import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { InstancedMesh, Instance } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Cube($$anchor) {
	const size = 0.02;
	const limit = 100;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			position: [0, 1.7, 0],
			children: ($$anchor, $$slotProps) => {
				InstancedMesh($$anchor, {
					limit,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
							T_BoxGeometry($$anchor, { args: [size, size, size] });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
							T_MeshStandardMaterial($$anchor, { roughness: 0, metalness: 0.2 });
						});

						var node_3 = $.sibling(node_2, 2);

						$.each(node_3, 17, () => ({ length: limit }), $.index, ($$anchor, _) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_4 = $.first_child(fragment_4);

									Collider(node_4, { shape: 'cuboid', args: [size / 2, size / 2, size / 2] });

									var node_5 = $.sibling(node_4, 2);

									Instance(node_5, { color: 'hotpink' });
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}