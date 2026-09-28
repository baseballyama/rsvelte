import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

import {
	Controller,
	Hand,
	Headset,
	XR,
	pointerControls,
	teleportControls
} from '@threlte/xr';

import { AudioListener, interactivity } from '@threlte/extras';
import { MathUtils } from 'three';
import Turntable from '../../extras/positional-audio/Turntable.svelte';
import Speaker from '../../extras/positional-audio/Speaker.svelte';
import Microphone from './Microphone.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let volume = $.state(0);

	interactivity();
	pointerControls('left');
	pointerControls('right');
	teleportControls('left');
	teleportControls('right');

	var fragment = root_3();
	var node = $.first_child(fragment);

	XR(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Headset(node_1, {
				children: ($$anchor, $$slotProps) => {
					Microphone($$anchor, { position: [-0.1, -0.05, -0.1], 'rotation.x': Math.PI / 3 });
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Controller(node_2, { left: true });

			var node_3 = $.sibling(node_2, 2);

			Controller(node_3, { right: true });

			var node_4 = $.sibling(node_3, 2);

			Hand(node_4, { left: true });

			var node_5 = $.sibling(node_4, 2);

			Hand(node_5, { right: true });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	Headset(node_6, {
		children: ($$anchor, $$slotProps) => {
			AudioListener($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			teleportSurface: true,
			receiveShadow: true,
			'rotation.x': -Math.PI / 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_8 = $.first_child(fragment_4);

				$.component(node_8, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [10, 64] });
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#333333' });
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var node_10 = $.sibling(node_7, 2);

	$.component(node_10, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			position: [0, 0.6, -0.5],
			scale: 0.08,
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_2();
				var node_11 = $.first_child(fragment_5);

				Turntable(node_11, {
					get volume() {
						return $.get(volume);
					},

					set volume($$value) {
						$.set(volume, $$value, true);
					}
				});

				var node_12 = $.sibling(node_11, 2);

				{
					let $0 = $.derived(() => MathUtils.DEG2RAD * -7);

					Speaker(node_12, {
						'position.x': 6,
						get 'rotation.y'() {
							return $.get($0);
						},

						get volume() {
							return $.get(volume);
						}
					});
				}

				var node_13 = $.sibling(node_12, 2);

				{
					let $0 = $.derived(() => MathUtils.DEG2RAD * 7);

					Speaker(node_13, {
						'position.x': -6,
						get 'rotation.y'() {
							return $.get($0);
						},

						get volume() {
							return $.get(volume);
						}
					});
				}

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_14 = $.sibling(node_10, 2);

	$.component(node_14, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, near: 0.001, position: [0, 1, 2] });
	});

	var node_15 = $.sibling(node_14, 2);

	$.component(node_15, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_16 = $.sibling(node_15, 2);

	$.component(node_16, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}