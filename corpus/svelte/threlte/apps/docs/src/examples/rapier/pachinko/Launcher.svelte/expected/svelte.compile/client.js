import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, RigidBody, usePhysicsTask, usePrismaticJoint } from '@threlte/rapier';
import { fromStore, get } from 'svelte/store';

import {
	CHANNEL_BOTTOM_Y,
	CHANNEL_TOP_Y,
	CHANNEL_X,
	FIELD_HEIGHT,
	ballRegistry,
	gameState
} from './gameState.svelte';

import { spawnQueue } from './spawnQueue.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Launcher($$anchor, $$props) {
	$.push($$props, true);

	const $rigidBodyA = () => $.store_get(rigidBodyA, '$rigidBodyA', $$stores);
	const $rigidBodyB = () => $.store_get(rigidBodyB, '$rigidBodyB', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const CHARGE_TIME_MS = 1000;
	const AUTOFIRE_INTERVAL_MS = 140;
	const ANCHOR_Y = -FIELD_HEIGHT / 2 + 0.2;
	const REST_OFFSET = 0.6;
	const COMPRESSED_OFFSET = 0;
	const SPRING_STIFFNESS = 4000;
	const SPRING_DAMPING = 3;
	const PLUNGER_HALF_HEIGHT = 0.08;
	const BALL_RADIUS = 0.14;
	const LOAD_GAP = 0.04;
	const { rigidBodyA, rigidBodyB, joint: jointStore } = usePrismaticJoint([0, 0, 0], [0, 0, 0], [0, 1, 0], [-0.05, REST_OFFSET + 0.1]);
	const joint = fromStore(jointStore);
	const plunger = fromStore(rigidBodyB);
	let configured = false;
	let lastAutoFire = 0;
	let ballsInLaunchZone = 0;
	let lastSpawnAt = 0;
	const SPAWN_DEBOUNCE_MS = 80;

	const loadBall = () => {
		if (ballsInLaunchZone > 0) return;

		const now = performance.now();

		if (now - lastSpawnAt < SPAWN_DEBOUNCE_MS) return;

		const plungerBody = get(rigidBodyB);

		if (!plungerBody) return;

		const p = plungerBody.translation();

		spawnQueue.spawn(p.x, p.y + PLUNGER_HALF_HEIGHT + BALL_RADIUS + LOAD_GAP, 0, 0);
		lastSpawnAt = now;
	};

	// Pre-load a ball on the plunger as soon as the body is available, so the
	// game opens with a ball already sitting in the launcher and the player can
	// fire on their first hold. The sensor + debounce inside loadBall keep this
	// from double-spawning if the effect re-runs.
	$.user_effect(() => {
		if (!plunger.current) return;

		loadBall();
	});

	// Runs in the simulation stage *before* the world steps, so the new motor
	// target is in place by the time rapier solves the joint forces this tick.
	usePhysicsTask((delta) => {
		const currentJoint = joint.current;

		if (!configured) {
			currentJoint.configureMotorPosition(REST_OFFSET, SPRING_STIFFNESS, SPRING_DAMPING);
			configured = true;
		}

		// ---- charge / autofire state machine ----
		if (gameState.holding) {
			gameState.charge = Math.min(1, gameState.charge + delta * 1000 / CHARGE_TIME_MS);

			if (gameState.charge >= 1) gameState.autoFiring = true;
		} else {
			gameState.charge = 0;
			gameState.autoFiring = false;
		}

		// ---- motor target + ball loading ----
		let target = REST_OFFSET;

		if (gameState.autoFiring) {
			const now = performance.now();
			const phase = (now - lastAutoFire) / AUTOFIRE_INTERVAL_MS % 1;

			if (phase < 0.45) {
				target = COMPRESSED_OFFSET;

				if (phase < 0.1) loadBall();
			} else {
				target = REST_OFFSET;
			}

			if (now - lastAutoFire > AUTOFIRE_INTERVAL_MS) lastAutoFire = now;
		} else if (gameState.holding) {
			target = REST_OFFSET + (COMPRESSED_OFFSET - REST_OFFSET) * gameState.charge;

			if (gameState.charge > 0.05) loadBall();
		}

		currentJoint.configureMotorPosition(target, SPRING_STIFFNESS, SPRING_DAMPING);
	});

	const sensorCenterY = (CHANNEL_BOTTOM_Y + CHANNEL_TOP_Y) / 2;
	const sensorHalfHeight = (CHANNEL_TOP_Y - CHANNEL_BOTTOM_Y) / 2;
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [CHANNEL_X, ANCHOR_Y, 0]);

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return $.get($0);
				},

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
							var fragment_2 = $.comment();
							var node_1 = $.first_child(fragment_2);

							$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
								T_Mesh($$anchor, {
									castShadow: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_2 = $.first_child(fragment_3);

										$.component(node_2, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
											T_BoxGeometry($$anchor, { args: [0.36, 0.1, 0.36] });
										});

										var node_3 = $.sibling(node_2, 2);

										$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
											T_MeshStandardMaterial($$anchor, { color: '#3a2a55', metalness: 0.6, roughness: 0.25 });
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		});
	}

	var node_4 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [CHANNEL_X, ANCHOR_Y + REST_OFFSET, 0]);

		$.component(node_4, () => T.Group, ($$anchor, T_Group_1) => {
			T_Group_1($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					RigidBody($$anchor, {
						type: 'dynamic',
						enabledTranslations: [false, true, false],
						enabledRotations: [false, false, false],
						linearDamping: 0.2,
						ccd: true,
						get rigidBody() {
							$.mark_store_binding();

							return $rigidBodyB();
						},

						set rigidBody($$value) {
							$.store_set(rigidBodyB, $$value);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_5 = $.first_child(fragment_5);

							Collider(node_5, {
								shape: 'cuboid',
								args: [0.12, PLUNGER_HALF_HEIGHT, 0.12],
								restitution: 0.1,
								friction: 0.4,
								density: 50
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
								T_Mesh_1($$anchor, {
									castShadow: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
											T_CylinderGeometry($$anchor, { args: [0.12, 0.12, PLUNGER_HALF_HEIGHT * 2, 16] });
										});

										var node_8 = $.sibling(node_7, 2);

										{
											let $0 = $.derived(() => 0.4 + gameState.charge * 0.8);

											$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
												T_MeshStandardMaterial_1($$anchor, {
													color: '#ff3366',
													emissive: '#ff1144',
													get emissiveIntensity() {
														return $.get($0);
													},
													metalness: 0.5,
													roughness: 0.3
												});
											});
										}

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		});
	}

	var node_9 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => [CHANNEL_X, sensorCenterY, 0]);

		$.component(node_9, () => T.Group, ($$anchor, T_Group_2) => {
			T_Group_2($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [0.15, sensorHalfHeight, 0.18]);

						Collider($$anchor, {
							shape: 'cuboid',
							get args() {
								return $.get($0);
							},
							sensor: true,
							onsensorenter: ({ targetCollider }) => {
								if (!ballRegistry.has(targetCollider.handle)) return;

								ballsInLaunchZone++;
							},

							onsensorexit: ({ targetCollider }) => {
								if (!ballRegistry.has(targetCollider.handle)) return;

								ballsInLaunchZone = Math.max(0, ballsInLaunchZone - 1);
							}
						});
					}
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}