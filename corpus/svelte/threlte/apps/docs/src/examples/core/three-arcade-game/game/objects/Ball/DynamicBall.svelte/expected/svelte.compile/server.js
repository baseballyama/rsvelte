import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { CoefficientCombineRule } from '@dimforge/rapier3d-compat';
import { T, useTask } from '@threlte/core';
import { AutoColliders, RigidBody } from '@threlte/rapier';
import { arenaHeight, playerHeight, playerToBorderDistance } from '../../config';
import { game } from '../../Game.svelte';
import { ballGeometry, ballMaterial } from './common';

export default function DynamicBall($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { startAtPosX } = $$props;
		let posX = untrack(() => startAtPosX);
		let rigidBody = void 0;

		const map = (value, inMin, inMax, outMin, outMax) => {
			return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
		};

		const ballSpeed = $.derived(() => {
			return map(game.levelIndex, 0, 9, 4, 11);
		});

		let ballIsSpawned = false;

		const spawnBall = () => {
			if (!rigidBody) return;

			ballIsSpawned = true;

			const randomSign = Math.random() > 0.5 ? 1 : -1;
			const randomX = randomSign * Math.random() * ballSpeed() / 2;

			rigidBody.applyImpulse({ x: randomX, y: 0, z: -ballSpeed() }, true);
		};

		const startAtPosZ = arenaHeight / 2 - playerHeight - playerToBorderDistance * 2;

		const onSensorEnter = () => {
			if (game.state === 'playing') {
				game.state = 'game-over';
			}
		};

		useTask(() => {
			if (!ballIsSpawned && rigidBody) {
				spawnBall();
				stop();
			}

			const rbTranslation = rigidBody?.translation();

			game.ballPosition = { x: rbTranslation?.x ?? 0, z: rbTranslation?.z ?? 0 };
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [posX, 0, startAtPosZ],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							type: 'dynamic',
							onsensorenter: onSensorEnter,
							enabledTranslations: [true, false, true],
							get rigidBody() {
								return rigidBody;
							},

							set rigidBody($$value) {
								rigidBody = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								AutoColliders($$renderer, {
									shape: 'ball',
									mass: 1,
									friction: 0,
									restitution: 1,
									restitutionCombineRule: CoefficientCombineRule.Max,
									frictionCombineRule: CoefficientCombineRule.Min,
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												children: ($$renderer) => {
													T($$renderer, { is: ballGeometry });
													$$renderer.push(`<!----> `);
													T($$renderer, { is: ballMaterial });
													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}