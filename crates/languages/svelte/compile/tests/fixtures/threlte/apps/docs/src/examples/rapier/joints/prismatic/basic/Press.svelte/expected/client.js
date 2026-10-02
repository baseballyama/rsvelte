import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody, usePrismaticJoint } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);

export default function Press($$anchor, $$props) {
	$.push($$props, true);

	let rail = $.state(void 0);
	let platform = $.state(void 0);
	const { rigidBodyA, rigidBodyB } = usePrismaticJoint([0, 0, 0], [0, 0, 0], [0, 1, 0], [-2.5, 2.5]);

	$.user_effect(() => {
		if ($.get(rail) && $.get(platform)) {
			rigidBodyA.set($.get(rail));
			rigidBodyB.set($.get(platform));
		}
	});

	const PUMP_INTERVAL = 1.4;
	let elapsed = 0;

	useTask((delta) => {
		if (!$.get(platform)) return;

		elapsed += delta;

		if (elapsed >= PUMP_INTERVAL) {
			elapsed = 0;
			$.get(platform).applyImpulse({ x: 0, y: 70, z: 0 }, true);
		}
	});

	CollisionGroups($$anchor, {
		memberships: [1],
		filter: [0],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					position: [0, 3, 0],
					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							type: 'fixed',
							get rigidBody() {
								return $.get(rail);
							},

							set rigidBody($$value) {
								$.set(rail, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_1 = $.first_child(fragment_3);

								Collider(node_1, { shape: 'cuboid', args: [0.15, 3, 0.15] });

								var node_2 = $.sibling(node_1, 2);

								$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
												T_BoxGeometry($$anchor, { args: [0.3, 6, 0.3] });
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
												T_MeshStandardMaterial($$anchor, { color: '#444', metalness: 0.7, roughness: 0.3 });
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

			var node_5 = $.sibling(node, 2);

			$.component(node_5, () => T.Group, ($$anchor, T_Group_1) => {
				T_Group_1($$anchor, {
					position: [0, 0.5, 0],
					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							get rigidBody() {
								return $.get(platform);
							},

							set rigidBody($$value) {
								$.set(platform, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_6 = $.first_child(fragment_6);

								Collider(node_6, {
									shape: 'cuboid',
									args: [1.5, 0.2, 1],
									density: 5,
									friction: 1.5
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
									T_Mesh_1($$anchor, {
										castShadow: true,
										receiveShadow: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root();
											var node_8 = $.first_child(fragment_7);

											$.component(node_8, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
												T_BoxGeometry_1($$anchor, { args: [3, 0.4, 2] });
											});

											var node_9 = $.sibling(node_8, 2);

											$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
												T_MeshStandardMaterial_1($$anchor, { color: '#222', metalness: 0.6, roughness: 0.4 });
											});

											$.append($$anchor, fragment_7);
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
}