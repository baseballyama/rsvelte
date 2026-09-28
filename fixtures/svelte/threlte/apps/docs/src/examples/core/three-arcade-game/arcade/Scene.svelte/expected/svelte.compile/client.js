import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene_1($$anchor, $$props) {
	$.push($$props, true);

	const $pointer = () => $.store_get(pointer, '$pointer', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	const cameraTweenZ = Tween.of(() => $.get(machineIsOff) ? 2.1 : 1.4, { duration: 3e3, easing: cubicInOut });
	const { pointer } = useInteractivity();
	let screenFocused = $.state(false);
	const screenPos = { x: 0, y: 1.3774, z: 0.1447 };

	const cameraTargetPos = Spring.of(
		() => $.get(screenFocused)
			? { ...screenPos, z: -screenPos.z }
			: { x: $pointer().x * 0.1, y: 1.23, z: 0 },
		{ precision: 0.000001 }
	);

	const cameraPos = Spring.of(
		() => $.get(screenFocused)
			? { x: screenPos.x, y: screenPos.y + 0.15, z: screenPos.z + 0.5 }
			: {
				x: $pointer().x * ($.get(machineIsOff) ? 0.1 : 0.1),
				y: 1.48,
				z: cameraTweenZ.current
			},
		{ stiffness: 0.05, damping: 0.9, precision: 0.00001 }
	);

	let cameraTarget = $.state(void 0);
	let camera = $.state(void 0);
	const backgroundColor = Tween.of(() => $.get(machineIsOff) ? new Color('#020203') : new Color('#020203'), { duration: 2.5e3 });

	useTask(() => {
		if (!$.get(camera) || !$.get(cameraTarget)) return;

		$.get(camera).lookAt($.get(cameraTarget).position);
	});

	const onScreenClick = () => {
		$.set(screenFocused, !$.get(screenFocused));
	};

	$.user_effect(() => {
		scene.background = new Color(backgroundColor.current);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => new Color(0x020203));

		$.component(node, () => T.Scene, ($$anchor, T_Scene) => {
			T_Scene($$anchor, {
				oncreate: (ref) => {
					game.arcadeMachineScene = ref;
				},

				get background() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => T.Object3D, ($$anchor, T_Object3D) => {
						T_Object3D($$anchor, {
							get 'position.x'() {
								return cameraTargetPos.current.x;
							},

							get 'position.y'() {
								return cameraTargetPos.current.y;
							},

							get 'position.z'() {
								return cameraTargetPos.current.z;
							},

							get ref() {
								return $.get(cameraTarget);
							},

							set ref($$value) {
								$.set(cameraTarget, $$value);
							}
						});
					});

					var node_2 = $.sibling(node_1, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
								T_PerspectiveCamera($$anchor, {
									'position.x': 20,
									'position.y': 20,
									'position.z': 20,
									fov: 60,
									makeDefault: true,
									children: ($$anchor, $$slotProps) => {
										OrbitControls($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera_1) => {
								T_PerspectiveCamera_1($$anchor, {
									get 'position.x'() {
										return cameraPos.current.x;
									},

									get 'position.y'() {
										return cameraPos.current.y;
									},

									get 'position.z'() {
										return cameraPos.current.z;
									},
									fov: 30,
									makeDefault: true,
									get ref() {
										return $.get(camera);
									},

									set ref($$value) {
										$.set(camera, $$value);
									}
								});
							});

							$.append($$anchor, fragment_4);
						};

						$.if(node_2, ($$render) => {
							if (game.orbitControls) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var node_5 = $.sibling(node_2, 2);

					Machine(node_5, {
						screenClicked: onScreenClick,
						get screenTexture() {
							return game.gameTexture;
						},

						get joystick() {
							return $.get(joystick);
						},

						get button() {
							return $.get(button);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					Lights(node_6, {
						get lightColor() {
							return game.averageScreenColor;
						},

						get machineIsOff() {
							return $.get(machineIsOff);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_8 = $.first_child(fragment_5);

								$.component(node_8, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
									T_CylinderGeometry($$anchor, { args: [1, 1, 0.04, 64] });
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
									T_MeshStandardMaterial($$anchor, { color: '#0f0f0f' });
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}