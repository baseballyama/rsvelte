import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas, extend } from '@threlte/core';
import { Checkbox, Color, Folder, Pane, Slider } from 'svelte-tweakpane-ui';
import { ACESFilmicToneMapping, MathUtils } from 'three';

import {
	DirectionalLight,
	MeshPhysicalNodeMaterial,
	MeshStandardMaterial,
	WebGPURenderer
} from 'three/webgpu';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	extend({
		DirectionalLight,
		MeshPhysicalNodeMaterial,
		MeshStandardMaterial
	});

	let arcAngleDegrees = $.state(90);
	let startAngleDegrees = $.state(60);
	let sliceColor = $.state('#ff4500');
	let rotate = $.state(true);
	const arcAngle = $.derived(() => MathUtils.DEG2RAD * $.get(arcAngleDegrees));
	const startAngle = $.derived(() => MathUtils.DEG2RAD * $.get(startAngleDegrees));
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: 'slice shader',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'rotate',
				get value() {
					return $.get(rotate);
				},

				set value($$value) {
					$.set(rotate, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Folder(node_2, {
				title: 'uniforms',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Color(node_3, {
						label: 'color',
						get value() {
							return $.get(sliceColor);
						},

						set value($$value) {
							$.set(sliceColor, $$value, true);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					Slider(node_4, {
						min: 0,
						max: 360,
						step: 1,
						label: 'start angle (degrees)',
						get value() {
							return $.get(startAngleDegrees);
						},

						set value($$value) {
							$.set(startAngleDegrees, $$value, true);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					Slider(node_5, {
						min: 0,
						max: 360,
						step: 1,
						label: 'arc angle (degrees)',
						get value() {
							return $.get(arcAngleDegrees);
						},

						set value($$value) {
							$.set(arcAngleDegrees, $$value, true);
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	Canvas(node_6, {
		get toneMapping() {
			return ACESFilmicToneMapping;
		},

		createRenderer: (canvas) => {
			return new WebGPURenderer({ antialias: true, canvas, forceWebGL: false });
		},

		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get rotate() {
					return $.get(rotate);
				},

				get arcAngle() {
					return $.get(arcAngle);
				},

				get sliceColor() {
					return $.get(sliceColor);
				},

				get startAngle() {
					return $.get(startAngle);
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}