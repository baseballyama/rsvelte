import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, AutoColliders } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);

export default function Goal($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get position() {
				return $$props.position;
			},

			get rotation() {
				return $$props.rotation;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.Group, ($$anchor, T_Group_1) => {
					T_Group_1($$anchor, {
						'position.y': 0.1,
						children: ($$anchor, $$slotProps) => {
							Collider($$anchor, {
								shape: 'cuboid',
								args: [0.4, 0.5, 0.4],
								sensor: true,
								get onsensorenter() {
									return $$props.ongoal;
								}
							});
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				AutoColliders(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
										T_BoxGeometry($$anchor, { args: [1, 1, 1] });
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
										T_MeshStandardMaterial($$anchor, { color: 'green' });
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}