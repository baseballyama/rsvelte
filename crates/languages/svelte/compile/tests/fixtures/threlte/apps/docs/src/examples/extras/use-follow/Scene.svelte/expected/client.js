import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="overlay svelte-bh3o30"><p class="hint svelte-bh3o30"> </p> <div class="stats svelte-bh3o30"><span>distance</span> <span class="value svelte-bh3o30"> </span></div> <div> </div></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

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
	let controls = $.state(void 0);
	let pillarMeshes = $.proxy([]);
	let rotation = $.state(0);

	const follow = useFollow(() => ({
		target: $$props.following ? character : undefined,
		controls: $.get(controls),
		lookAtOffset: $$props.lookAtOffset,
		deadZone: $$props.deadZone,
		lookAhead: $$props.lookAhead,
		followSmoothTime: $$props.followSmoothTime,
		trackRotation: $$props.trackRotation,
		trackRotationSmoothTime: $$props.trackRotationSmoothTime,
		trackRotationOffset: $$props.trackRotationOffset
	}));

	const colliderMeshes = $.derived(() => $$props.collision ? pillarMeshes.filter(Boolean) : []);
	const azimuthMin = $.derived(() => $$props.azimuthLocked ? 0 : -Infinity);
	const azimuthMax = $.derived(() => $$props.azimuthLocked ? 0 : Infinity);

	$.user_effect(() => {
		if (!$.get(controls)) return;

		$.get(controls).dollyTo($$props.distance, true);
		$.get(controls).rotateTo($$props.azimuthAngle, $$props.polarAngle, true);
	});

	const sprinting = $.derived(() => input.action('sprint').pressed);
	const moveX = $.derived(() => input.axis('moveLeft', 'moveRight'));
	const moveY = $.derived(() => input.axis('moveForward', 'moveBack'));

	const translating = $.derived(() => $$props.trackRotation
		? $.get(moveY) !== 0
		: $.get(moveX) !== 0 || $.get(moveY) !== 0);

	const action = $.derived(() => $.get(translating) ? $.get(sprinting) ? 'run' : 'walk' : 'idle');
	const walkSpeed = 2;
	const runSpeed = 4.5;
	const rotationSpeed = 10;
	const turnSpeed = 2.5;
	const worldMove = new Vector3();
	let targetRotation = 0;

	useTask(
		(delta) => {
			const speed = $.get(sprinting) ? runSpeed : walkSpeed;

			if ($$props.trackRotation) {
				$.set(rotation, $.get(rotation) - $.get(moveX) * turnSpeed * delta);
				follow.getTargetDirection(0, -$.get(moveY), worldMove);
				character.position.addScaledVector(worldMove, speed * delta);
			} else {
				follow.getInputDirection($.get(moveX), -$.get(moveY), worldMove);
				character.position.addScaledVector(worldMove, speed * delta);

				if ($.get(translating)) {
					targetRotation = Math.atan2(worldMove.x, worldMove.z);
				}

				let diff = targetRotation - $.get(rotation);

				diff = MathUtils.euclideanModulo(diff + Math.PI, Math.PI * 2) - Math.PI;
				$.set(rotation, $.get(rotation) + diff * Math.min(1, rotationSpeed * delta));
			}
		},
		{ after: input.task, before: follow.task }
	);

	const rightStick = gamepad.stick('rightStick');
	const orbitSpeed = 2.8; // radians/sec at full stick

	useTask(
		(delta) => {
			if (!$.get(controls) || $$props.trackRotation) return;

			const { x, y } = rightStick;

			if (x === 0 && y === 0) return;

			$.get(controls).rotate(-x * orbitSpeed * delta, -y * orbitSpeed * delta, true);
		},
		{ after: [gamepad.task, follow.task] }
	);

	let liveDistance = $.state(0);

	useTask(
		() => {
			if (!$.get(controls)) return;

			$.set(liveDistance, $.get(controls).camera.position.distanceTo(character.position), true);
		},
		{ after: follow.task }
	);

	const pillars = Array.from({ length: 8 }, (_, i) => {
		const angle = (i + 0.5) * Math.PI * 2 / 8;

		return [Math.cos(angle) * 5, Math.sin(angle) * 5];
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, fov: 55, position: [0, 3, 6] });
	});

	var node_1 = $.sibling(node, 2);

	CameraControls(node_1, {
		get pointerLock() {
			return $$props.pointerLock;
		},

		get smoothTime() {
			return $$props.smoothTime;
		},

		get distance() {
			return $$props.distance;
		},

		get minPolarAngle() {
			return $$props.minPolarAngle;
		},

		get maxPolarAngle() {
			return $$props.maxPolarAngle;
		},

		get minAzimuthAngle() {
			return $.get(azimuthMin);
		},

		get maxAzimuthAngle() {
			return $.get(azimuthMax);
		},

		get colliderMeshes() {
			return $.get(colliderMeshes);
		},

		get 'mouseButtons.wheel'() {
			return CameraControlsRef.ACTION.NONE;
		},

		get ref() {
			return $.get(controls);
		},

		set ref($$value) {
			$.set(controls, $$value);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [5, 10, 5], intensity: 1.5, castShadow: true });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.4 });
	});

	var node_4 = $.sibling(node_3, 2);

	Grid(node_4, {
		cellColor: '#444444',
		sectionColor: '#ff3e00',
		sectionSize: 5,
		cellSize: 1,
		gridSize: [30, 30],
		fadeDistance: 15,
		infiniteGrid: true,
		fadeOrigin: [0, 0, 0]
	});

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'rotation.x': -Math.PI / 2,
			'position.y': -0.01,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_6 = $.first_child(fragment_1);

				$.component(node_6, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [20, 72] });
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#eaeaea' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_5, 2);

	$.each(node_8, 17, () => pillars, $.index, ($$anchor, $$item, i) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let x = () => $.get($$array)[0];
		let z = () => $.get($$array)[1];
		var fragment_2 = $.comment();
		var node_9 = $.first_child(fragment_2);

		{
			let $0 = $.derived(() => [x(), 1.5, z()]);

			$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					get position() {
						return $.get($0);
					},
					castShadow: true,
					receiveShadow: true,
					get ref() {
						return pillarMeshes[i];
					},

					set ref($$value) {
						pillarMeshes[i] = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_10 = $.first_child(fragment_3);

						$.component(node_10, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
							T_BoxGeometry($$anchor, { args: [1, 3, 1] });
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
							T_MeshStandardMaterial_1($$anchor, { color: '#4a90d9' });
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_2);
	});

	var node_12 = $.sibling(node_8, 2);

	T(node_12, {
		get is() {
			return character;
		},

		get 'rotation.y'() {
			return $.get(rotation);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_13 = $.first_child(fragment_4);

			Character(node_13, {
				get action() {
					return $.get(action);
				}
			});

			var node_14 = $.sibling(node_13, 2);

			$.component(node_14, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					'position.y': 2.4,
					children: ($$anchor, $$slotProps) => {
						HTML($$anchor, {
							center: true,
							transform: false,
							children: ($$anchor, $$slotProps) => {
								var div = root_1();
								var p = $.child(div);
								var text = $.only_child(p);
								var div_1 = $.sibling(p, 2);
								var span = $.sibling($.child(div_1), 2);
								var text_1 = $.only_child(span, true);

								$.reset(div_1);

								var div_2 = $.sibling(div_1, 2);
								let classes;
								var text_2 = $.only_child(div_2, true);

								$.reset(div);

								$.template_effect(
									($0) => {
										$.set_text(text, `${$$props.trackRotation ? 'W/S move · A/D turn' : 'WASD to move'} · Shift to sprint${$$props.pointerLock ? ' · click to look' : ''}`);
										$.set_text(text_1, $0);
										classes = $.set_class(div_2, 1, 'badge svelte-bh3o30', null, classes, { on: $$props.following });
										$.set_text(text_2, $$props.following ? $.get(action) : 'paused');
									},
									[() => $.get(liveDistance).toFixed(2)]
								);

								$.append($$anchor, div);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}