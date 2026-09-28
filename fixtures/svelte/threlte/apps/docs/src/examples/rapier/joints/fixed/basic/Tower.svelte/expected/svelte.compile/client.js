import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody } from '@threlte/rapier';
import FixedJoint from './FixedJoint.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Tower($$anchor, $$props) {
	const bricks = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return position();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.each(node_1, 16, () => ({ length: 5 }), $.index, ($$anchor, $$item, i) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => T.Group, ($$anchor, T_Group_1) => {
							T_Group_1($$anchor, {
								position: [0, 0.5 + i, 0],
								children: ($$anchor, $$slotProps) => {
									RigidBody($$anchor, {
										get rigidBody() {
											return bodies[i];
										},

										set rigidBody($$value) {
											bodies[i] = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_3 = $.first_child(fragment_4);

											Collider(node_3, { shape: 'cuboid', args: [0.5, 0.5, 0.5] });

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
												T_Mesh($$anchor, {
													castShadow: true,
													receiveShadow: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root();
														var node_5 = $.first_child(fragment_5);

														$.component(node_5, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
															T_BoxGeometry($$anchor, { args: [1, 1, 1] });
														});

														var node_6 = $.sibling(node_5, 2);

														$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
															T_MeshStandardMaterial($$anchor, {
																get color() {
																	return color();
																}
															});
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

						$.append($$anchor, fragment_2);
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment);
	};

	let position = $.prop($$props, 'position', 19, () => [0, 0, 0]),
		jointed = $.prop($$props, 'jointed', 3, false),
		color = $.prop($$props, 'color', 3, '#FE3D00');

	const COUNT = 5;
	const bodies = $.proxy(Array.from({ length: 5 }, () => undefined));
	const allReady = $.derived(() => bodies.every(Boolean));
	var fragment_6 = root();
	var node_7 = $.first_child(fragment_6);

	{
		var consequent = ($$anchor) => {
			CollisionGroups($$anchor, {
				memberships: [2],
				filter: [0, 1],
				children: ($$anchor, $$slotProps) => {
					bricks($$anchor);
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			bricks($$anchor);
		};

		$.if(node_7, ($$render) => {
			if (jointed()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_8 = $.sibling(node_7, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_10 = $.comment();
			var node_9 = $.first_child(fragment_10);

			$.each(node_9, 17, () => Array(COUNT - 1), $.index, ($$anchor, _, i) => {
				FixedJoint($$anchor, {
					get bodyA() {
						return bodies[i];
					},

					get bodyB() {
						return bodies[i + 1];
					},
					anchorA: [0.5 * (i % 2 === 1 ? -1 : 1), 0.5, 0],
					anchorB: [0, -0.5, 0]
				});
			});

			$.append($$anchor, fragment_10);
		};

		$.if(node_8, ($$render) => {
			if (jointed() && $.get(allReady)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment_6);
}