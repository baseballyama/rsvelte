import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T, useTask } from '@threlte/core';
import { useInputMap, useGamepad, useKeyboard, Grid, HTML } from '@threlte/extras';
import Character from './Character.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p class="hint svelte-gausnq"> </p>`);
var root_2 = $.from_html(`<p class="hint svelte-gausnq">Left Stick to move, LB to sprint</p>`);
var root_3 = $.from_html(`<div class="overlay svelte-gausnq"><!> <div class="info svelte-gausnq"><span class="label svelte-gausnq">vector</span> <span class="value svelte-gausnq"> </span></div> <div> </div></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let sprintKey = $.prop($$props, 'sprintKey', 3, 'Shift'),
		activeDevice = $.prop($$props, 'activeDevice', 15, 'keyboard');

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
			sprint: [key(sprintKey()), gamepadButton('leftBumper')]
		}),
		{ keyboard, gamepad }
	);

	// Prevent arrow keys from scrolling the page
	keyboard.on('keydown', (e) => {
		if (e.key.startsWith('Arrow')) e.preventDefault();
	});

	$.user_effect(() => {
		activeDevice(input.activeDevice.current);
	});

	const sprinting = $.derived(() => input.action('sprint').pressed);
	const moveX = $.derived(() => input.axis('moveLeft', 'moveRight'));
	const moveY = $.derived(() => input.axis('moveForward', 'moveBack'));
	const moving = $.derived(() => $.get(moveX) !== 0 || $.get(moveY) !== 0);
	const action = $.derived(() => $.get(moving) ? $.get(sprinting) ? 'run' : 'walk' : 'idle');
	let x = $.state(0);
	let z = $.state(0);
	let rotation = $.state(0);
	let targetRotation = 0;
	const rotationSpeed = 10;
	const sprintSpeed = 4;
	const walkSpeed = 2;

	useTask(
		(delta) => {
			const move = input.vector('moveLeft', 'moveRight', 'moveForward', 'moveBack');
			const speed = $.get(sprinting) ? sprintSpeed : walkSpeed;

			$.set(x, $.get(x) + move.x * speed * delta);
			$.set(z, $.get(z) + move.y * speed * delta);

			// Smoothly rotate character to face movement direction
			if ($.get(moving)) {
				targetRotation = Math.atan2(move.x, move.y);
			}

			// Lerp rotation using shortest path around the circle
			let diff = targetRotation - $.get(rotation);

			// Wrap to [-PI, PI] so we always take the shortest turn
			diff = MathUtils.euclideanModulo(diff + Math.PI, Math.PI * 2) - Math.PI;

			$.set(rotation, $.get(rotation) + diff * Math.min(1, rotationSpeed * delta));
		},
		{ after: input.task }
	);

	var fragment = root_4();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [0, 4, 5],
			oncreate: (ref) => ref.lookAt(0, 1, 0),
			makeDefault: true,
			fov: 50
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [5, 10, 5], intensity: 1.5, castShadow: true });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.4 });
	});

	var node_3 = $.sibling(node_2, 2);

	Grid(node_3, {
		cellColor: '#444444',
		sectionColor: '#ff3e00',
		sectionSize: 5,
		cellSize: 1,
		gridSize: [20, 20],
		fadeDistance: 10,
		fadeOrigin: [0, 0, 0],
		infiniteGrid: true
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'rotation.x': -Math.PI / 2,
			'position.y': -0.01,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_5 = $.first_child(fragment_1);

				$.component(node_5, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [15, 72] });
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'white' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_4, 2);

	$.component(node_7, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get 'position.x'() {
				return $.get(x);
			},

			get 'position.z'() {
				return $.get(z);
			},

			get 'rotation.y'() {
				return $.get(rotation);
			},

			children: ($$anchor, $$slotProps) => {
				Character($$anchor, {
					get action() {
						return $.get(action);
					}
				});
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_7, 2);

	$.component(node_8, () => T.Group, ($$anchor, T_Group_1) => {
		T_Group_1($$anchor, {
			get 'position.x'() {
				return $.get(x);
			},
			'position.y': 2.5,
			get 'position.z'() {
				return $.get(z);
			},

			children: ($$anchor, $$slotProps) => {
				HTML($$anchor, {
					center: true,
					transform: false,
					children: ($$anchor, $$slotProps) => {
						var div = root_3();
						var node_9 = $.child(div);

						{
							var consequent = ($$anchor) => {
								var p = root_1();
								var text = $.only_child(p);

								$.template_effect(() => $.set_text(text, `WASD / Arrows to move, ${sprintKey() ?? ''} to sprint`));
								$.append($$anchor, p);
							};

							var alternate = ($$anchor) => {
								var p_1 = root_2();

								$.append($$anchor, p_1);
							};

							$.if(node_9, ($$render) => {
								if (input.activeDevice.current === 'keyboard') $$render(consequent); else $$render(alternate, -1);
							});
						}

						var div_1 = $.sibling(node_9, 2);
						var span = $.sibling($.child(div_1), 2);
						var text_1 = $.only_child(span);

						$.reset(div_1);

						var div_2 = $.sibling(div_1, 2);
						let classes;
						var text_2 = $.only_child(div_2, true);

						$.reset(div);

						$.template_effect(
							($0, $1) => {
								$.set_text(text_1, `(${$0 ?? ''}, ${$1 ?? ''})`);

								classes = $.set_class(div_2, 1, 'badge svelte-gausnq', null, classes, {
									sprint: $.get(sprinting),
									walk: $.get(moving) && !$.get(sprinting)
								});

								$.set_text(text_2, $.get(action));
							},
							[() => $.get(moveX).toFixed(2), () => $.get(moveY).toFixed(2)]
						);

						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}