import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import { CoefficientCombineRule } from '@dimforge/rapier3d-compat';
import { T, useTask } from '@threlte/core';
import { AutoColliders, RigidBody } from '@threlte/rapier';
import { arenaHeight, playerHeight, playerToBorderDistance } from '../../config';
import { game } from '../../Game.svelte';
import { ballGeometry, ballMaterial } from './common';

var root = $.from_html(`<!> <!>`, 1);

export default function DynamicBall($$anchor, $$props) {
	$.push($$props, true);

	let posX = $.proxy(untrack(() => $$props.startAtPosX));
	let rigidBody = $.state(void 0);

	const map = (value, inMin, inMax, outMin, outMax) => {
		return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	};

	const ballSpeed = $.derived(() => {
		return map(game.levelIndex, 0, 9, 4, 11);
	});

	let ballIsSpawned = false;

	const spawnBall = () => {
		if (!$.get(rigidBody)) return;

		ballIsSpawned = true;

		const randomSign = Math.random() > 0.5 ? 1 : -1;
		const randomX = randomSign * Math.random() * $.get(ballSpeed) / 2;

		$.get(rigidBody).applyImpulse({ x: randomX, y: 0, z: -$.get(ballSpeed) }, true);
	};

	const startAtPosZ = arenaHeight / 2 - playerHeight - playerToBorderDistance * 2;

	const onSensorEnter = () => {
		if (game.state === 'playing') {
			game.state = 'game-over';
		}
	};

	useTask(() => {
		if (!ballIsSpawned && $.get(rigidBody)) {
			spawnBall();
			stop();
		}

		const rbTranslation = $.get(rigidBody)?.translation();

		game.ballPosition = { x: rbTranslation?.x ?? 0, z: rbTranslation?.z ?? 0 };
	});

	$.user_effect(() => {
		if ($.get(rigidBody)) game.ballRigidBody = $.get(rigidBody);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [posX, 0, startAtPosZ]);

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					RigidBody($$anchor, {
						type: 'dynamic',
						onsensorenter: onSensorEnter,
						enabledTranslations: [true, false, true],
						get rigidBody() {
							return $.get(rigidBody);
						},

						set rigidBody($$value) {
							$.set(rigidBody, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							AutoColliders($$anchor, {
								shape: 'ball',
								mass: 1,
								friction: 0,
								restitution: 1,
								get restitutionCombineRule() {
									return CoefficientCombineRule.Max;
								},

								get frictionCombineRule() {
									return CoefficientCombineRule.Min;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_1 = $.first_child(fragment_3);

									$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
										T_Mesh($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_2 = $.first_child(fragment_4);

												T(node_2, {
													get is() {
														return ballGeometry;
													}
												});

												var node_3 = $.sibling(node_2, 2);

												T(node_3, {
													get is() {
														return ballMaterial;
													}
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
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}