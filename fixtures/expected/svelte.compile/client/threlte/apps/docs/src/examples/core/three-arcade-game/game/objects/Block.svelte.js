import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Edges } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';
import { cubicIn } from 'svelte/easing';
import { Tween } from 'svelte/motion';
import { clamp } from 'three/src/math/MathUtils.js';
import { game } from '../Game.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Block($$anchor, $$props) {
	$.push($$props, true);

	const scale = new Tween(0, { easing: cubicIn });

	scale.set(1);

	let innerColor = $.derived(() => $$props.blinkingColors
		? game.blinkClock === 0
			? $$props.blinkingColors.innerA
			: $$props.blinkingColors.innerB
		: $$props.staticColors.inner);

	let outerColor = $.derived(() => $$props.blinkingColors
		? game.blinkClock === 0
			? $$props.blinkingColors.outerA
			: $$props.blinkingColors.outerB
		: $$props.staticColors.outer);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get 'position.x'() {
				return $$props.position.x;
			},

			get 'position.z'() {
				return $$props.position.z;
			},

			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => !$$props.hit || $$props.freeze ? 'fixed' : 'dynamic');
					let $1 = $.derived(() => $$props.hit ? -1 : 1);

					RigidBody($$anchor, {
						get type() {
							return $.get($0);
						},
						canSleep: false,
						get dominance() {
							return $.get($1);
						},
						enabledTranslations: [true, false, true],
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => [$$props.size / 2, 1 / 2, $$props.size / 2]);

								Collider($$anchor, {
									shape: 'cuboid',
									get args() {
										return $.get($0);
									},

									oncontact: (e) => {
										if (e.totalForceMagnitude > 2000 || e.totalForceMagnitude < 300) return;

										const volume = clamp(Math.max(e.totalForceMagnitude, 0) / 2000, 0, 1);

										game.sound.playFromGroup('bounce', { volume });
									},

									oncollisionexit: () => {
										if (!$$props.hit) {
											$$props.onHit?.();
										}
									},
									mass: 1,
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_1 = $.first_child(fragment_3);

										$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
											T_Mesh($$anchor, {
												get scale() {
													return scale.current;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_2 = $.first_child(fragment_4);

													{
														let $0 = $.derived(() => [$$props.size, 1, $$props.size]);

														$.component(node_2, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
															T_BoxGeometry($$anchor, {
																get args() {
																	return $.get($0);
																}
															});
														});
													}

													var node_3 = $.sibling(node_2, 2);

													$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
														T_MeshStandardMaterial($$anchor, {
															get color() {
																return $.get(innerColor);
															},
															transparent: true,
															opacity: 0.6
														});
													});

													var node_4 = $.sibling(node_3, 2);

													Edges(node_4, {
														get color() {
															return $.get(outerColor);
														},
														scale: 1.01
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
							}
						},
						$$slots: { default: true }
					});
				}
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}