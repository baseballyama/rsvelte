import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';
import { T, useTask } from '@threlte/core';
import { useInputMap, useGamepad, useKeyboard, Grid, HTML } from '@threlte/extras';
import Character from './Character.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { sprintKey = 'Shift', activeDevice = 'keyboard' } = $$props;
		const keyboard = useKeyboard(() => ({ capture: true }));
		const gamepad = useGamepad();

		const input = useInputMap(
			({ key, gamepadAxis, gamepadButton }) => ({
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
				sprint: [key(sprintKey), gamepadButton('leftBumper')]
			}),
			{ keyboard, gamepad }
		);

		// Prevent arrow keys from scrolling the page
		keyboard.on('keydown', (e) => {
			if (e.key.startsWith('Arrow')) e.preventDefault();
		});

		const sprinting = $.derived(() => input.action('sprint').pressed);
		const moveX = $.derived(() => input.axis('moveLeft', 'moveRight'));
		const moveY = $.derived(() => input.axis('moveForward', 'moveBack'));
		const moving = $.derived(() => moveX() !== 0 || moveY() !== 0);
		const action = $.derived(() => moving() ? sprinting() ? 'run' : 'walk' : 'idle');
		let x = 0;
		let z = 0;
		let rotation = 0;
		let targetRotation = 0;
		const rotationSpeed = 10;
		const sprintSpeed = 4;
		const walkSpeed = 2;

		useTask(
			(delta) => {
				const move = input.vector('moveLeft', 'moveRight', 'moveForward', 'moveBack');
				const speed = sprinting() ? sprintSpeed : walkSpeed;

				x += move.x * speed * delta;
				z += move.y * speed * delta;

				// Smoothly rotate character to face movement direction
				if (moving()) {
					targetRotation = Math.atan2(move.x, move.y);
				}

				// Lerp rotation using shortest path around the circle
				let diff = targetRotation - rotation;

				// Wrap to [-PI, PI] so we always take the shortest turn
				diff = MathUtils.euclideanModulo(diff + Math.PI, Math.PI * 2) - Math.PI;

				rotation += diff * Math.min(1, rotationSpeed * delta);
			},
			{ after: input.task }
		);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				position: [0, 4, 5],
				oncreate: (ref) => ref.lookAt(0, 1, 0),
				makeDefault: true,
				fov: 50
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

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
			gridSize: [20, 20],
			fadeDistance: 10,
			fadeOrigin: [0, 0, 0],
			infiniteGrid: true
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
						T.CircleGeometry($$renderer, { args: [15, 72] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: 'white' });
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

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.x': x,
				'position.z': z,
				'rotation.y': rotation,
				children: ($$renderer) => {
					Character($$renderer, { action: action() });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.x': x,
				'position.y': 2.5,
				'position.z': z,
				children: ($$renderer) => {
					HTML($$renderer, {
						center: true,
						transform: false,
						children: ($$renderer) => {
							$$renderer.push(`<div class="overlay svelte-gausnq">`);

							if (input.activeDevice.current === 'keyboard') {
								$$renderer.push(`<!--[0--><p class="hint svelte-gausnq">WASD / Arrows to move, ${$.escape(sprintKey)} to sprint</p>`);
							} else {
								$$renderer.push(`<!--[-1--><p class="hint svelte-gausnq">Left Stick to move, LB to sprint</p>`);
							}

							$$renderer.push(`<!--]--> <div class="info svelte-gausnq"><span class="label svelte-gausnq">vector</span> <span class="value svelte-gausnq">(${$.escape(moveX().toFixed(2))}, ${$.escape(moveY().toFixed(2))})</span></div> <div${$.attr_class('badge svelte-gausnq', void 0, { 'sprint': sprinting(), 'walk': moving() && !sprinting() })}>${$.escape(action())}</div></div>`);
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

		$.bind_props($$props, { activeDevice });
	});
}