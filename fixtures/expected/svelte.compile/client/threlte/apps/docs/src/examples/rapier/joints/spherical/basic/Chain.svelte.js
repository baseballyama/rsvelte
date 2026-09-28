import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody, useSphericalJoint } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Chain($$anchor, $$props) {
	$.push($$props, true);

	const segments = 10;
	const spacing = 0.4;
	const radius = 0.18;
	const wreckingRadius = 0.4;
	const beadDensity = 1;
	const wreckingDensity = 3;
	const wreckingOffset = radius + wreckingRadius + 0.05;
	const wreckingAnchor = wreckingOffset - spacing / 2;
	const bodies = $.proxy(Array.from({ length: segments + 1 }, () => undefined));
	const allReady = $.derived(() => bodies.every(Boolean));

	// Chain extends to the -x direction, so each upper-side anchor is on its left
	// surface (-x in local), each lower-side anchor on its right (+x).
	const joints = Array.from({ length: segments }, (_, i) => {
		if (i === 0) {
			return useSphericalJoint([0, 0, 0], [spacing / 2, 0, 0]);
		}

		if (i === segments - 1) {
			return useSphericalJoint([-spacing / 2, 0, 0], [wreckingAnchor, 0, 0]);
		}

		return useSphericalJoint([-spacing / 2, 0, 0], [spacing / 2, 0, 0]);
	});

	$.user_effect(() => {
		if ($.get(allReady)) {
			joints.forEach((joint, i) => {
				joint.rigidBodyA.set(bodies[i]);
				joint.rigidBodyB.set(bodies[i + 1]);
			});
		}
	});

	CollisionGroups($$anchor, {
		memberships: [1],
		filter: [0],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					position: [0, 5, 0],
					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							type: 'fixed',
							get rigidBody() {
								return bodies[0];
							},

							set rigidBody($$value) {
								bodies[0] = $$value;
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

			$.each(node_4, 17, () => ({ length: segments - 1 }), $.index, ($$anchor, $$item, i) => {
				var fragment_5 = $.comment();
				var node_5 = $.first_child(fragment_5);

				$.component(node_5, () => T.Group, ($$anchor, T_Group_1) => {
					T_Group_1($$anchor, {
						position: [-spacing / 2 - i * spacing, 5, 0],
						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								linearDamping: 0.1,
								angularDamping: 0.1,
								get rigidBody() {
									return bodies[i + 1];
								},

								set rigidBody($$value) {
									bodies[i + 1] = $$value;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root();
									var node_6 = $.first_child(fragment_7);

									Collider(node_6, { shape: 'ball', args: [radius], density: beadDensity });

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
										T_Mesh_1($$anchor, {
											castShadow: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_8 = $.first_child(fragment_8);

												$.component(node_8, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
													T_SphereGeometry($$anchor, { args: [radius, 16, 12] });
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

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			});

			var node_10 = $.sibling(node_4, 2);

			$.component(node_10, () => T.Group, ($$anchor, T_Group_2) => {
				T_Group_2($$anchor, {
					position: [
						-spacing / 2 - (segments - 2) * spacing - wreckingOffset,
						5,
						0
					],

					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							linearDamping: 0.1,
							angularDamping: 0.1,
							get rigidBody() {
								return bodies[segments];
							},

							set rigidBody($$value) {
								bodies[segments] = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root();
								var node_11 = $.first_child(fragment_10);

								Collider(node_11, {
									shape: 'ball',
									args: [wreckingRadius],
									density: wreckingDensity
								});

								var node_12 = $.sibling(node_11, 2);

								$.component(node_12, () => T.Mesh, ($$anchor, T_Mesh_2) => {
									T_Mesh_2($$anchor, {
										castShadow: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_11 = root();
											var node_13 = $.first_child(fragment_11);

											$.component(node_13, () => T.SphereGeometry, ($$anchor, T_SphereGeometry_1) => {
												T_SphereGeometry_1($$anchor, { args: [wreckingRadius, 24, 16] });
											});

											var node_14 = $.sibling(node_13, 2);

											$.component(node_14, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
												T_MeshStandardMaterial_2($$anchor, { color: '#222', metalness: 0.8, roughness: 0.3 });
											});

											$.append($$anchor, fragment_11);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_10);
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