import * as $ from 'svelte/internal/server';
import { Group, MathUtils, Vector3 } from 'three';
import { T, useTask } from '@threlte/core';

import {
	CameraControls,
	CameraControlsRef,
	Grid,
	HTML,
	useFollow,
	useGamepad,
	useInputMap,
	useKeyboard
} from '@threlte/extras';

import Character from './Character.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			smoothTime,
			distance,
			minPolarAngle,
			maxPolarAngle,
			polarAngle,
			azimuthLocked,
			azimuthAngle,
			pointerLock,
			lookAtOffset,
			deadZone,
			lookAhead,
			followSmoothTime,
			trackRotation,
			trackRotationSmoothTime,
			trackRotationOffset,
			collision,
			following
		} = $$props;

		const keyboard = useKeyboard(() => ({ capture: true }));
		const gamepad = useGamepad();

		const input = useInputMap(
			({ key, gamepadButton, gamepadAxis }) => ({
				moveLeft: [
					key('a'),
					key('ArrowLeft'),
					gamepadButton('directionalLeft'),
					gamepadAxis('leftStick', 'x', -1)
				],
				moveRight: [
					key('d'),
					key('ArrowRight'),
					gamepadButton('directionalRight'),
					gamepadAxis('leftStick', 'x', 1)
				],
				moveForward: [
					key('w'),
					key('ArrowUp'),
					gamepadButton('directionalTop'),
					gamepadAxis('leftStick', 'y', -1)
				],
				moveBack: [
					key('s'),
					key('ArrowDown'),
					gamepadButton('directionalBottom'),
					gamepadAxis('leftStick', 'y', 1)
				],
				sprint: [key('Shift'), gamepadButton('leftBumper')]
			}),
			{ keyboard, gamepad }
		);

		keyboard.on('keydown', (e) => {
			if (e.key.startsWith('Arrow')) e.preventDefault();
		});

		const character = new Group();
		let controls = void 0;
		let pillarMeshes = [];
		let rotation = 0;

		const follow = useFollow(() => ({
			target: following ? character : undefined,
			controls,
			lookAtOffset,
			deadZone,
			lookAhead,
			followSmoothTime,
			trackRotation,
			trackRotationSmoothTime,
			trackRotationOffset
		}));

		const colliderMeshes = $.derived(() => collision ? pillarMeshes.filter(Boolean) : []);
		const azimuthMin = $.derived(() => azimuthLocked ? 0 : -Infinity);
		const azimuthMax = $.derived(() => azimuthLocked ? 0 : Infinity);
		const sprinting = $.derived(() => input.action('sprint').pressed);
		const moveX = $.derived(() => input.axis('moveLeft', 'moveRight'));
		const moveY = $.derived(() => input.axis('moveForward', 'moveBack'));
		const translating = $.derived(() => trackRotation ? moveY() !== 0 : moveX() !== 0 || moveY() !== 0);
		const action = $.derived(() => translating() ? sprinting() ? 'run' : 'walk' : 'idle');
		const walkSpeed = 2;
		const runSpeed = 4.5;
		const rotationSpeed = 10;
		const turnSpeed = 2.5;
		const worldMove = new Vector3();
		let targetRotation = 0;

		useTask(
			(delta) => {
				const speed = sprinting() ? runSpeed : walkSpeed;

				if (trackRotation) {
					rotation -= moveX() * turnSpeed * delta;
					follow.getTargetDirection(0, -moveY(), worldMove);
					character.position.addScaledVector(worldMove, speed * delta);
				} else {
					follow.getInputDirection(moveX(), -moveY(), worldMove);
					character.position.addScaledVector(worldMove, speed * delta);

					if (translating()) {
						targetRotation = Math.atan2(worldMove.x, worldMove.z);
					}

					let diff = targetRotation - rotation;

					diff = MathUtils.euclideanModulo(diff + Math.PI, Math.PI * 2) - Math.PI;
					rotation += diff * Math.min(1, rotationSpeed * delta);
				}
			},
			{ after: input.task, before: follow.task }
		);

		const rightStick = gamepad.stick('rightStick');
		const orbitSpeed = 2.8; // radians/sec at full stick

		useTask(
			(delta) => {
				if (!controls || trackRotation) return;

				const { x, y } = rightStick;

				if (x === 0 && y === 0) return;

				controls.rotate(-x * orbitSpeed * delta, -y * orbitSpeed * delta, true);
			},
			{ after: [gamepad.task, follow.task] }
		);

		let liveDistance = 0;

		useTask(
			() => {
				if (!controls) return;

				liveDistance = controls.camera.position.distanceTo(character.position);
			},
			{ after: follow.task }
		);

		const pillars = Array.from({ length: 8 }, (_, i) => {
			const angle = (i + 0.5) * Math.PI * 2 / 8;

			return [Math.cos(angle) * 5, Math.sin(angle) * 5];
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');
				T.PerspectiveCamera($$renderer, { makeDefault: true, fov: 55, position: [0, 3, 6] });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			CameraControls($$renderer, {
				pointerLock,
				smoothTime,
				distance,
				minPolarAngle,
				maxPolarAngle,
				minAzimuthAngle: azimuthMin(),
				maxAzimuthAngle: azimuthMax(),
				colliderMeshes: colliderMeshes(),
				'mouseButtons.wheel': CameraControlsRef.ACTION.NONE,
				get ref() {
					return controls;
				},

				set ref($$value) {
					controls = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (T.DirectionalLight) {
				$$renderer.push('<!--[-->');
				T.DirectionalLight($$renderer, { position: [5, 10, 5], intensity: 1.5, castShadow: true });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.AmbientLight) {
				$$renderer.push('<!--[-->');
				T.AmbientLight($$renderer, { intensity: 0.4 });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Grid($$renderer, {
				cellColor: '#444444',
				sectionColor: '#ff3e00',
				sectionSize: 5,
				cellSize: 1,
				gridSize: [30, 30],
				fadeDistance: 15,
				infiniteGrid: true,
				fadeOrigin: [0, 0, 0]
			});

			$$renderer.push(`<!----> `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'rotation.x': -Math.PI / 2,
					'position.y': -0.01,
					receiveShadow: true,
					children: ($$renderer) => {
						if (T.CircleGeometry) {
							$$renderer.push('<!--[-->');
							T.CircleGeometry($$renderer, { args: [20, 72] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { color: '#eaeaea' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <!--[-->`);

			const each_array = $.ensure_array_like(pillars);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let [x, z] = each_array[i];

				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						position: [x, 1.5, z],
						castShadow: true,
						receiveShadow: true,
						get ref() {
							return pillarMeshes[i];
						},

						set ref($$value) {
							pillarMeshes[i] = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (T.BoxGeometry) {
								$$renderer.push('<!--[-->');
								T.BoxGeometry($$renderer, { args: [1, 3, 1] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshStandardMaterial($$renderer, { color: '#4a90d9' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]--> `);

			T($$renderer, {
				is: character,
				'rotation.y': rotation,
				children: ($$renderer) => {
					Character($$renderer, { action: action() });
					$$renderer.push(`<!----> `);

					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							'position.y': 2.4,
							children: ($$renderer) => {
								HTML($$renderer, {
									center: true,
									transform: false,
									children: ($$renderer) => {
										$$renderer.push(`<div class="overlay svelte-bh3o30"><p class="hint svelte-bh3o30">${$.escape(trackRotation ? 'W/S move · A/D turn' : 'WASD to move')} · Shift to sprint${$.escape(pointerLock ? ' · click to look' : '')}</p> <div class="stats svelte-bh3o30"><span>distance</span> <span class="value svelte-bh3o30">${$.escape(liveDistance.toFixed(2))}</span></div> <div${$.attr_class('badge svelte-bh3o30', void 0, { 'on': following })}>${$.escape(following ? action() : 'paused')}</div></div>`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}