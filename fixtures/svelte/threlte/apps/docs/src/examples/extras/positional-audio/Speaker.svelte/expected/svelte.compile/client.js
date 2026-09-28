import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Edges } from '@threlte/extras';
import { cubicIn, cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'volume']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Speaker($$anchor, $$props) {
	$.push($$props, true);

	let volume = $.prop($$props, 'volume', 3, 0),
		rest = $.rest_props($$props, rest_excludes);

	let jumpOffsetY = new Tween(0);
	let jumpRotationX = new Tween(0);
	let jumpRotationZ = new Tween(0);
	let isJumping = $.state(false);
	const randomSign = () => Math.round(Math.random()) * 2 - 1;

	const jump = () => {
		$.set(isJumping, true);

		const upDuration = 10 + Math.random() * 50;

		jumpOffsetY.set(0.2, { duration: upDuration, easing: cubicOut });
		jumpRotationX.set(Math.random() * 4 * randomSign(), { duration: upDuration, easing: cubicOut });
		jumpRotationZ.set(Math.random() * 4 * randomSign(), { duration: upDuration, easing: cubicOut });

		setTimeout(
			() => {
				const downDuration = 40 + Math.random() * 70;

				jumpOffsetY.set(0, { duration: downDuration, easing: cubicIn });
				jumpRotationX.set(0, { duration: downDuration, easing: cubicIn });
				jumpRotationZ.set(0, { duration: downDuration, easing: cubicIn });

				setTimeout(
					() => {
						$.set(isJumping, false);
					},
					downDuration * 1.5
				);
			},
			upDuration
		);
	};

	$.user_effect(() => {
		if (volume() > 0.25 && !$.get(isJumping)) jump();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, $.spread_props(() => rest, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => MathUtils.DEG2RAD * jumpRotationZ.current);
					let $1 = $.derived(() => MathUtils.DEG2RAD * jumpRotationX.current);

					$.component(node_1, () => T.Group, ($$anchor, T_Group_1) => {
						T_Group_1($$anchor, {
							get 'position.y'() {
								return jumpOffsetY.current;
							},

							get 'rotation.z'() {
								return $.get($0);
							},

							get 'rotation.x'() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										castShadow: true,
										receiveShadow: true,
										'position.y': 2.5,
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_3 = $.first_child(fragment_3);

											$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
												T_BoxGeometry($$anchor, { args: [3, 5, 3] });
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
												T_MeshStandardMaterial($$anchor, { color: '#eedbcb' });
											});

											var node_5 = $.sibling(node_4, 2);

											Edges(node_5, { color: 'black', scale: 1.001 });
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_6 = $.sibling(node_2, 2);

								{
									let $0 = $.derived(() => 1 + volume());
									let $1 = $.derived(() => MathUtils.DEG2RAD * -90);

									$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
										T_Mesh_1($$anchor, {
											'position.z': 1.1,
											'position.y': 3.5,
											get scale() {
												return $.get($0);
											},

											get 'rotation.x'() {
												return $.get($1);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_7 = $.first_child(fragment_4);

												$.component(node_7, () => T.ConeGeometry, ($$anchor, T_ConeGeometry) => {
													T_ConeGeometry($$anchor, { args: [1, 1, 64] });
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
													T_MeshStandardMaterial_1($$anchor, { flatShading: true, color: '#111111' });
												});

												var node_9 = $.sibling(node_8, 2);

												Edges(node_9, { color: 'black', scale: 1.001, thresholdAngle: 20 });
												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}