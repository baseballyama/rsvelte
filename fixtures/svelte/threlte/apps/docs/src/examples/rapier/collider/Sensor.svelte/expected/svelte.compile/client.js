import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { AutoColliders, Collider, RigidBody } from '@threlte/rapier';
import { Color } from 'three';
import TestBed from './TestBed.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><p>This collider is marked as a sensor and as such does<br/> not participate in contacts and collisions and can be<br/> useful to detect presence in areas.</p></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Sensor($$anchor, $$props) {
	$.push($$props, true);

	const gray = new Color(0x333333);
	const brand = new Color(0xff3f00);
	let present = $.state(false);
	let rigidBody = $.state(void 0);
	const offset = Date.now();

	useTask(() => {
		const positionZ = Math.sin(Date.now() / 2000) * 2.5;
		const positionX = Math.sin((Date.now() + offset) / 1500) * 1.2;

		$.get(rigidBody)?.setNextKinematicTranslation({ x: positionX, y: 1, z: positionZ });
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			position: [0, 1, 0],
			children: ($$anchor, $$slotProps) => {
				Collider($$anchor, {
					onsensorenter: () => $.set(present, true),
					onsensorexit: () => $.set(present, false),
					sensor: true,
					shape: 'cuboid',
					args: [1, 1, 1]
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Group, ($$anchor, T_Group_1) => {
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
								var fragment_4 = $.comment();
								var node_2 = $.first_child(fragment_4);

								$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										castShadow: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_3 = $.first_child(fragment_5);

											$.component(node_3, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
												T_SphereGeometry($$anchor, {});
											});

											var node_4 = $.sibling(node_3, 2);

											{
												let $0 = $.derived(() => $.get(present) ? brand : gray);

												$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
													T_MeshStandardMaterial($$anchor, {
														get color() {
															return $.get($0);
														}
													});
												});
											}

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
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node_1, 2);

	{
		const text = ($$anchor) => {
			var div = root_1();

			$.append($$anchor, div);
		};

		TestBed(node_5, { title: 'Sensor Collider', text, $$slots: { text: true } });
	}

	$.append($$anchor, fragment);
	$.pop();
}