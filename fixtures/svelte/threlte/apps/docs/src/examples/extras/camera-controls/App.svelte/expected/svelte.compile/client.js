import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Button, Checkbox, Pane, Separator } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import { MathUtils } from 'three';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let controls = $.state(void 0);
	let mesh = $.state(void 0);

	/**
	 * controls.enabled can not be bound to since its not reactive
	 */
	let enabled = $.state(true);

	$.user_effect(() => {
		if ($.get(controls) !== undefined) {
			$.get(controls).enabled = $.get(enabled);
		}
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Camera Controls',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				title: 'rotate(45deg, 0)',
				$$events: {
					click: () => {
						$.get(controls)?.rotate(45 * MathUtils.DEG2RAD, 0, true);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				title: 'rotate(-90deg, 0)',
				$$events: {
					click: () => {
						$.get(controls)?.rotate(-90 * MathUtils.DEG2RAD, 0, true);
					}
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				title: 'rotate(360deg, 0)',
				$$events: {
					click: () => {
						$.get(controls)?.rotate(360 * MathUtils.DEG2RAD, 0, true);
					}
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				title: 'rotate(0, 20deg)',
				$$events: {
					click: () => {
						$.get(controls)?.rotate(0, 20 * MathUtils.DEG2RAD, true);
					}
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Separator(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				title: 'truck(1, 0)',
				$$events: {
					click: () => {
						$.get(controls)?.truck(1, 0, true);
					}
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				title: 'truck(0, 1)',
				$$events: {
					click: () => {
						$.get(controls)?.truck(0, 1, true);
					}
				}
			});

			var node_8 = $.sibling(node_7, 2);

			Button(node_8, {
				title: 'truck(-1, -1)',
				$$events: {
					click: () => {
						$.get(controls)?.truck(-1, -1, true);
					}
				}
			});

			var node_9 = $.sibling(node_8, 2);

			Separator(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			Button(node_10, {
				title: 'dolly(1)',
				$$events: {
					click: () => {
						$.get(controls)?.dolly(1, true);
					}
				}
			});

			var node_11 = $.sibling(node_10, 2);

			Button(node_11, {
				title: 'dolly(-1)',
				$$events: {
					click: () => {
						$.get(controls)?.dolly(-1, true);
					}
				}
			});

			var node_12 = $.sibling(node_11, 2);

			Separator(node_12, {});

			var node_13 = $.sibling(node_12, 2);

			Button(node_13, {
				title: 'zoom(camera.zoom / 2)',
				$$events: {
					click: () => {
						$.get(controls)?.zoom($.get(controls).camera.zoom / 2, true);
					}
				}
			});

			var node_14 = $.sibling(node_13, 2);

			Button(node_14, {
				title: 'zoom(-camera.zoom / 2)',
				$$events: {
					click: () => {
						$.get(controls)?.zoom(-$.get(controls).camera.zoom / 2, true);
					}
				}
			});

			var node_15 = $.sibling(node_14, 2);

			Separator(node_15, {});

			var node_16 = $.sibling(node_15, 2);

			Button(node_16, {
				title: 'moveTo(3, 5, 2)',
				$$events: {
					click: () => {
						$.get(controls)?.moveTo(3, 5, 2, true);
					}
				}
			});

			var node_17 = $.sibling(node_16, 2);

			Button(node_17, {
				title: 'fitToBox(mesh)',
				$$events: {
					click: () => {
						if ($.get(mesh) !== undefined) {
							$.get(controls)?.fitToBox($.get(mesh), true);
						}
					}
				}
			});

			var node_18 = $.sibling(node_17, 2);

			Separator(node_18, {});

			var node_19 = $.sibling(node_18, 2);

			Button(node_19, {
				title: 'setPosition(-5, 2, 1)',
				$$events: {
					click: () => {
						$.get(controls)?.setPosition(-5, 2, 1, true);
					}
				}
			});

			var node_20 = $.sibling(node_19, 2);

			Button(node_20, {
				title: 'setTarget(3, 0, -3)',
				$$events: {
					click: () => {
						$.get(controls)?.setTarget(3, 0, -3, true);
					}
				}
			});

			var node_21 = $.sibling(node_20, 2);

			Button(node_21, {
				title: 'setLookAt(1, 2, 3, 1, 1, 0)',
				$$events: {
					click: () => {
						$.get(controls)?.setLookAt(1, 2, 3, 1, 1, 0, true);
					}
				}
			});

			var node_22 = $.sibling(node_21, 2);

			Separator(node_22, {});

			var node_23 = $.sibling(node_22, 2);

			Button(node_23, {
				title: 'lerpLookAt(-2,0,0,1,1,0,0,2,5,-1,0,0,random())',
				$$events: {
					click: () => {
						$.get(controls)?.lerpLookAt(-2, 0, 0, 1, 1, 0, 0, 2, 5, -1, 0, 0, Math.random(), true);
					}
				}
			});

			var node_24 = $.sibling(node_23, 2);

			Separator(node_24, {});

			var node_25 = $.sibling(node_24, 2);

			Button(node_25, {
				title: 'reset()',
				$$events: {
					click: () => {
						$.get(controls)?.reset(true);
					}
				}
			});

			var node_26 = $.sibling(node_25, 2);

			Button(node_26, {
				title: 'saveState()',
				$$events: {
					click: () => {
						$.get(controls)?.saveState();
					}
				}
			});

			var node_27 = $.sibling(node_26, 2);

			Separator(node_27, {});

			var node_28 = $.sibling(node_27, 2);

			Checkbox(node_28, {
				label: 'enabled',
				get value() {
					return $.get(enabled);
				},

				set value($$value) {
					$.set(enabled, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_29 = $.sibling(node, 2);

	Canvas(node_29, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get controls() {
					return $.get(controls);
				},

				set controls($$value) {
					$.set(controls, $$value);
				},

				get mesh() {
					return $.get(mesh);
				},

				set mesh($$value) {
					$.set(mesh, $$value);
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}