import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody } from '@threlte/rapier';
import FixedJoint from './FixedJoint.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Hammer($$anchor, $$props) {
	let position = $.prop($$props, 'position', 19, () => [0, 6, 0]),
		rotation = $.prop($$props, 'rotation', 19, () => [0, 0, Math.PI / 6]),
		velocity = $.prop($$props, 'velocity', 19, () => [0, 0, 0]);

	let handle = $.state(void 0);
	let head = $.state(void 0);
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get position() {
				return position();
			},

			get rotation() {
				return rotation();
			},

			children: ($$anchor, $$slotProps) => {
				CollisionGroups($$anchor, {
					memberships: [1],
					filter: [0, 2],
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => T.Group, ($$anchor, T_Group_1) => {
							T_Group_1($$anchor, {
								position: [-0.6, 0, 0],
								children: ($$anchor, $$slotProps) => {
									RigidBody($$anchor, {
										get linearVelocity() {
											return velocity();
										},

										get rigidBody() {
											return $.get(handle);
										},

										set rigidBody($$value) {
											$.set(handle, $$value, true);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_2 = $.first_child(fragment_4);

											Collider(node_2, { shape: 'cuboid', args: [1.2, 0.15, 0.15], density: 0.5 });

											var node_3 = $.sibling(node_2, 2);

											$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
												T_Mesh($$anchor, {
													castShadow: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root();
														var node_4 = $.first_child(fragment_5);

														$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
															T_BoxGeometry($$anchor, { args: [2.4, 0.3, 0.3] });
														});

														var node_5 = $.sibling(node_4, 2);

														$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
															T_MeshStandardMaterial($$anchor, { color: '#8B5A2B' });
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => T.Group, ($$anchor, T_Group_2) => {
							T_Group_2($$anchor, {
								position: [1, 0, 0],
								children: ($$anchor, $$slotProps) => {
									RigidBody($$anchor, {
										get linearVelocity() {
											return velocity();
										},

										get rigidBody() {
											return $.get(head);
										},

										set rigidBody($$value) {
											$.set(head, $$value, true);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root();
											var node_7 = $.first_child(fragment_7);

											Collider(node_7, { shape: 'cuboid', args: [0.4, 0.4, 0.4], density: 8 });

											var node_8 = $.sibling(node_7, 2);

											$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_1) => {
												T_Mesh_1($$anchor, {
													castShadow: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root();
														var node_9 = $.first_child(fragment_8);

														$.component(node_9, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
															T_BoxGeometry_1($$anchor, { args: [0.8, 0.8, 0.8] });
														});

														var node_10 = $.sibling(node_9, 2);

														$.component(node_10, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
															T_MeshStandardMaterial_1($$anchor, { color: '#444', metalness: 0.8, roughness: 0.3 });
														});

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
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

	var node_11 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			FixedJoint($$anchor, {
				get bodyA() {
					return $.get(handle);
				},

				get bodyB() {
					return $.get(head);
				},
				anchorA: [1.2, 0, 0],
				anchorB: [-0.4, 0, 0]
			});
		};

		$.if(node_11, ($$render) => {
			if ($.get(handle) && $.get(head)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}