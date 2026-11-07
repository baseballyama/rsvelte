import * as $ from 'svelte/internal/server';
import { T, useTask, useThrelte } from '@threlte/core';
import { useInteractivity, OrbitControls } from '@threlte/extras';
import { cubicInOut } from 'svelte/easing';
import { Spring, Tween } from 'svelte/motion';
import { Color, Object3D, PerspectiveCamera, Scene } from 'three';
import { useArcadeControls } from '../game/controls.svelte';
import { game } from '../game/Game.svelte';
import Lights from './Lights.svelte';
import Machine from './Machine.svelte';
import { Button, StickPosition } from './types';

export default function Scene_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { scene } = useThrelte();
		const controls = useArcadeControls();
		const left = controls.action('left');
		const right = controls.action('right');
		const advance = controls.action('advance');

		let joystick = $.derived(() => {
			if (left.pressed && !right.pressed) {
				return StickPosition.Left;
			} else if (!left.pressed && right.pressed) {
				return StickPosition.Right;
			} else {
				return StickPosition.Idle;
			}
		});

		let button = $.derived(() => advance.pressed ? Button.Pressed : Button.Idle);
		const machineIsOff = $.derived(() => game.state == 'off' ? true : false);
		const cameraTweenZ = Tween.of(() => machineIsOff() ? 2.1 : 1.4, { duration: 3e3, easing: cubicInOut });
		const { pointer } = useInteractivity();
		let screenFocused = false;
		const screenPos = { x: 0, y: 1.3774, z: 0.1447 };

		const cameraTargetPos = Spring.of(
			() => screenFocused
				? { ...screenPos, z: -screenPos.z }
				: {
					x: $.store_get($$store_subs ??= {}, '$pointer', pointer).x * 0.1,
					y: 1.23,
					z: 0
				},
			{ precision: 0.000001 }
		);

		const cameraPos = Spring.of(
			() => screenFocused
				? { x: screenPos.x, y: screenPos.y + 0.15, z: screenPos.z + 0.5 }
				: {
					x: $.store_get($$store_subs ??= {}, '$pointer', pointer).x * (machineIsOff() ? 0.1 : 0.1),
					y: 1.48,
					z: cameraTweenZ.current
				},
			{ stiffness: 0.05, damping: 0.9, precision: 0.00001 }
		);

		let cameraTarget = void 0;
		let camera = void 0;
		const backgroundColor = Tween.of(() => machineIsOff() ? new Color('#020203') : new Color('#020203'), { duration: 2.5e3 });

		useTask(() => {
			if (!camera || !cameraTarget) return;

			camera.lookAt(cameraTarget.position);
		});

		const onScreenClick = () => {
			screenFocused = !screenFocused;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.Scene) {
				$$renderer.push('<!--[-->');

				T.Scene($$renderer, {
					oncreate: (ref) => {
						game.arcadeMachineScene = ref;
					},
					background: new Color(0x020203),
					children: ($$renderer) => {
						if (T.Object3D) {
							$$renderer.push('<!--[-->');

							T.Object3D($$renderer, {
								'position.x': cameraTargetPos.current.x,
								'position.y': cameraTargetPos.current.y,
								'position.z': cameraTargetPos.current.z,
								get ref() {
									return cameraTarget;
								},

								set ref($$value) {
									cameraTarget = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (game.orbitControls) {
							$$renderer.push('<!--[0-->');

							if (T.PerspectiveCamera) {
								$$renderer.push('<!--[-->');

								T.PerspectiveCamera($$renderer, {
									'position.x': 20,
									'position.y': 20,
									'position.z': 20,
									fov: 60,
									makeDefault: true,
									children: ($$renderer) => {
										OrbitControls($$renderer, {});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');

							if (T.PerspectiveCamera) {
								$$renderer.push('<!--[-->');

								T.PerspectiveCamera($$renderer, {
									'position.x': cameraPos.current.x,
									'position.y': cameraPos.current.y,
									'position.z': cameraPos.current.z,
									fov: 30,
									makeDefault: true,
									get ref() {
										return camera;
									},

									set ref($$value) {
										camera = $$value;
										$$settled = false;
									}
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]--> `);

						Machine($$renderer, {
							screenClicked: onScreenClick,
							screenTexture: game.gameTexture,
							joystick: joystick(),
							button: button()
						});

						$$renderer.push(`<!----> `);

						Lights($$renderer, {
							lightColor: game.averageScreenColor,
							machineIsOff: machineIsOff()
						});

						$$renderer.push(`<!----> `);

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								children: ($$renderer) => {
									if (T.CylinderGeometry) {
										$$renderer.push('<!--[-->');
										T.CylinderGeometry($$renderer, { args: [1, 1, 0.04, 64] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: '#0f0f0f' });
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}