import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { AutoColliders, Collider, RigidBody } from '@threlte/rapier';
import { Vector3 } from 'three';
import TestBed from './TestBed.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><p></p></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function AttachedCollider($$anchor, $$props) {
	$.push($$props, true);

	let rigidBody = $.state(void 0);
	const position = new Vector3(0, 1, 0);
	let elapsed = 0;

	useTask((dt) => {
		elapsed += dt;
		position.x = Math.sin(elapsed);
		position.z = Math.cos(elapsed);
		$.get(rigidBody)?.setNextKinematicTranslation(position);
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			position: [0, 2, 0],
			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								castShadow: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
										T_MeshStandardMaterial($$anchor, { color: 0xff3f00 });
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
										T_BoxGeometry($$anchor, { args: [2, 2, 2] });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						Collider(node_4, { shape: 'cuboid', args: [1, 1, 1] });
						$.append($$anchor, fragment_2);
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
			position: [0, 1, 0],
			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					type: 'kinematicPosition',
					lockRotations: true,
					get rigidBody() {
						return $.get(rigidBody);
					},

					set rigidBody($$value) {
						$.set(rigidBody, $$value);
					},

					children: ($$anchor, $$slotProps) => {
						AutoColliders($$anchor, {
							shape: 'ball',
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_6 = $.first_child(fragment_6);

								$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
									T_Mesh_1($$anchor, {
										castShadow: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root();
											var node_7 = $.first_child(fragment_7);

											$.component(node_7, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
												T_SphereGeometry($$anchor, { args: [1] });
											});

											var node_8 = $.sibling(node_7, 2);

											$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
												T_MeshStandardMaterial_1($$anchor, {});
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
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node_5, 2);

	{
		const text = ($$anchor) => {
			var div = root_1();
			var p = $.child(div);

			p.textContent = 'Nesting one or multiple <Collider> components in a <RigidBody> component effectively attaches\n        the colliders to the rigid body and allow the rigid body to be affected by contact forces and\n        gravity.';
			$.reset(div);
			$.append($$anchor, div);
		};

		TestBed(node_9, { title: 'Attached Collider', text, $$slots: { text: true } });
	}

	$.append($$anchor, fragment);
	$.pop();
}