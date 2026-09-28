import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody, useRevoluteJoint } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Pendulum($$anchor, $$props) {
	$.push($$props, true);

	const $rigidBodyA = () => $.store_get(rigidBodyA, '$rigidBodyA', $$stores);
	const $rigidBodyB = () => $.store_get(rigidBodyB, '$rigidBodyB', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { rigidBodyA, rigidBodyB } = useRevoluteJoint([0, 0, 0], [0, 2, 0], [0, 0, 1]);

	CollisionGroups($$anchor, {
		memberships: [1],
		filter: [0],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					position: [0, 6, 0],
					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							type: 'fixed',
							get rigidBody() {
								$.mark_store_binding();

								return $rigidBodyA();
							},

							set rigidBody($$value) {
								$.store_set(rigidBodyA, $$value);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_1 = $.first_child(fragment_3);

								$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_2 = $.first_child(fragment_4);

											$.component(node_2, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
												T_BoxGeometry($$anchor, { args: [0.3, 0.3, 0.3] });
											});

											var node_3 = $.sibling(node_2, 2);

											$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
												T_MeshStandardMaterial($$anchor, { color: '#222' });
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
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => T.Group, ($$anchor, T_Group_1) => {
				T_Group_1($$anchor, {
					position: [1.732, 5, 0],
					rotation: [0, 0, Math.PI / 3],
					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							get rigidBody() {
								$.mark_store_binding();

								return $rigidBodyB();
							},

							set rigidBody($$value) {
								$.store_set(rigidBodyB, $$value);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_5 = $.first_child(fragment_6);

								Collider(node_5, { shape: 'cuboid', args: [0.2, 1.5, 0.2], density: 1 });

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => T.Group, ($$anchor, T_Group_2) => {
									T_Group_2($$anchor, {
										'position.y': -1.7,
										children: ($$anchor, $$slotProps) => {
											Collider($$anchor, { shape: 'ball', args: [0.5], density: 20 });
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
									T_Mesh_1($$anchor, {
										castShadow: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root();
											var node_8 = $.first_child(fragment_8);

											$.component(node_8, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
												T_BoxGeometry_1($$anchor, { args: [0.4, 3, 0.4] });
											});

											var node_9 = $.sibling(node_8, 2);

											$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
												T_MeshStandardMaterial_1($$anchor, { color: '#8B5A2B' });
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								var node_10 = $.sibling(node_7, 2);

								$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_2) => {
									T_Mesh_2($$anchor, {
										castShadow: true,
										'position.y': -1.7,
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root();
											var node_11 = $.first_child(fragment_9);

											$.component(node_11, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
												T_SphereGeometry($$anchor, { args: [0.5, 24, 16] });
											});

											var node_12 = $.sibling(node_11, 2);

											$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
												T_MeshStandardMaterial_2($$anchor, { color: '#222', metalness: 0.8, roughness: 0.3 });
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}