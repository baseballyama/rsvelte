import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Pane, Slider, Checkbox, Button, Folder, List, Point } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="svelte-9srtwf"><!></div>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const presets = {
		'Third Person': {
			smoothTime: 0.2,
			distance: 6,
			minPolarAngle: 0.3,
			maxPolarAngle: 1.5,
			polarAngle: 1.1,
			azimuthLocked: false,
			azimuthAngle: 0,
			pointerLock: true,
			lookAtOffset: [0, 1, 0],
			deadZone: [0, 0],
			lookAhead: 0,
			followSmoothTime: 0.15,
			trackRotation: false,
			trackRotationSmoothTime: 0,
			trackRotationOffset: 0
		},
		Fixed: {
			smoothTime: 0.2,
			distance: 5,
			minPolarAngle: 0.4,
			maxPolarAngle: 1.4,
			polarAngle: 1.1,
			azimuthLocked: false,
			azimuthAngle: 0,
			pointerLock: false,
			lookAtOffset: [0, 1, 0],
			deadZone: [0, 0],
			lookAhead: 0,
			followSmoothTime: 0,
			trackRotation: true,
			trackRotationSmoothTime: 0.25,
			trackRotationOffset: Math.PI
		},
		'Top-Down': {
			smoothTime: 0.2,
			distance: 11,
			minPolarAngle: 0.6,
			maxPolarAngle: 0.6,
			polarAngle: 0.6,
			azimuthLocked: true,
			azimuthAngle: 0,
			pointerLock: false,
			lookAtOffset: [0, 0, 0],
			deadZone: [0, 0],
			lookAhead: 0,
			followSmoothTime: 0,
			trackRotation: false,
			trackRotationSmoothTime: 0,
			trackRotationOffset: 0
		},
		Sidescroller: {
			smoothTime: 0.25,
			distance: 7,
			minPolarAngle: Math.PI / 2,
			maxPolarAngle: Math.PI / 2,
			polarAngle: Math.PI / 2,
			azimuthLocked: true,
			azimuthAngle: 0,
			pointerLock: false,
			lookAtOffset: [0, 1, 0],
			deadZone: [1.5, 0.5],
			lookAhead: 0,
			followSmoothTime: 0.1,
			trackRotation: false,
			trackRotationSmoothTime: 0,
			trackRotationOffset: 0
		},
		Racing: {
			smoothTime: 0.08,
			distance: 6,
			minPolarAngle: 1,
			maxPolarAngle: 1,
			polarAngle: 1,
			azimuthLocked: true,
			azimuthAngle: 0,
			pointerLock: false,
			lookAtOffset: [0, 0.8, 0],
			deadZone: [0, 0],
			lookAhead: 0.4,
			followSmoothTime: 0.05,
			trackRotation: false,
			trackRotationSmoothTime: 0,
			trackRotationOffset: 0
		},
		Cinematic: {
			smoothTime: 0.6,
			distance: 14,
			minPolarAngle: 0.8,
			maxPolarAngle: 0.8,
			polarAngle: 0.8,
			azimuthLocked: true,
			azimuthAngle: 0,
			pointerLock: false,
			lookAtOffset: [0, 1.2, 0],
			deadZone: [0, 0],
			lookAhead: 0,
			followSmoothTime: 0.5,
			trackRotation: false,
			trackRotationSmoothTime: 0,
			trackRotationOffset: 0
		}
	};

	const presetOptions = Object.fromEntries(Object.keys(presets).map((k) => [k, k]));
	let preset = $.state('Third Person');
	let smoothTime = $.state(0.2);
	let distance = $.state(6);
	let minPolarAngle = $.state(0.3);
	let maxPolarAngle = $.state(1.5);
	let polarAngle = $.state(1.1);
	let azimuthLocked = $.state(false);
	let azimuthAngle = $.state(0);
	let pointerLock = $.state(true);
	let lookAtOffset = $.state($.proxy([0, 1, 0]));
	let deadZone = $.state($.proxy([0, 0]));
	let lookAhead = $.state(0);
	let followSmoothTime = $.state(0.15);
	let trackRotation = $.state(false);
	let trackRotationSmoothTime = $.state(0);
	let trackRotationOffset = $.state(0);
	let collision = $.state(true);
	let following = $.state(true);

	const apply = (preset) => {
		$.set(smoothTime, preset.smoothTime, true);
		$.set(distance, preset.distance, true);
		$.set(minPolarAngle, preset.minPolarAngle, true);
		$.set(maxPolarAngle, preset.maxPolarAngle, true);
		$.set(polarAngle, preset.polarAngle, true);
		$.set(azimuthLocked, preset.azimuthLocked, true);
		$.set(azimuthAngle, preset.azimuthAngle, true);
		$.set(pointerLock, preset.pointerLock, true);
		$.set(lookAtOffset, preset.lookAtOffset, true);
		$.set(deadZone, preset.deadZone, true);
		$.set(lookAhead, preset.lookAhead, true);
		$.set(followSmoothTime, preset.followSmoothTime, true);
		$.set(trackRotation, preset.trackRotation, true);
		$.set(trackRotationSmoothTime, preset.trackRotationSmoothTime, true);
		$.set(trackRotationOffset, preset.trackRotationOffset, true);
	};

	$.user_effect(() => {
		apply(presets[$.get(preset)]);
	});

	var fragment = root_3();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			List(node_1, {
				label: 'preset',
				get options() {
					return presetOptions;
				},

				get value() {
					return $.get(preset);
				},

				set value($$value) {
					$.set(preset, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Folder(node_2, {
				title: 'CameraControls',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Slider(node_3, {
						label: 'smoothTime',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(smoothTime);
						},

						set value($$value) {
							$.set(smoothTime, $$value, true);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					Slider(node_4, {
						label: 'distance',
						min: 1,
						max: 20,
						step: 0.1,
						get value() {
							return $.get(distance);
						},

						set value($$value) {
							$.set(distance, $$value, true);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					Slider(node_5, {
						label: 'minPolarAngle',
						min: 0,
						max: Math.PI,
						step: 0.01,
						get value() {
							return $.get(minPolarAngle);
						},

						set value($$value) {
							$.set(minPolarAngle, $$value, true);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					Slider(node_6, {
						label: 'maxPolarAngle',
						min: 0,
						max: Math.PI,
						step: 0.01,
						get value() {
							return $.get(maxPolarAngle);
						},

						set value($$value) {
							$.set(maxPolarAngle, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Checkbox(node_7, {
						label: 'azimuthLocked',
						get value() {
							return $.get(azimuthLocked);
						},

						set value($$value) {
							$.set(azimuthLocked, $$value, true);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					Checkbox(node_8, {
						label: 'pointerLock',
						get value() {
							return $.get(pointerLock);
						},

						set value($$value) {
							$.set(pointerLock, $$value, true);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					Checkbox(node_9, {
						label: 'collision',
						get value() {
							return $.get(collision);
						},

						set value($$value) {
							$.set(collision, $$value, true);
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_2, 2);

			Folder(node_10, {
				title: 'useFollow',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_11 = $.first_child(fragment_3);

					Point(node_11, {
						label: 'lookAtOffset',
						min: -3,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(lookAtOffset);
						},

						set value($$value) {
							$.set(lookAtOffset, $$value, true);
						}
					});

					var node_12 = $.sibling(node_11, 2);

					Point(node_12, {
						label: 'deadZone',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(deadZone);
						},

						set value($$value) {
							$.set(deadZone, $$value, true);
						}
					});

					var node_13 = $.sibling(node_12, 2);

					Slider(node_13, {
						label: 'lookAhead',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(lookAhead);
						},

						set value($$value) {
							$.set(lookAhead, $$value, true);
						}
					});

					var node_14 = $.sibling(node_13, 2);

					Slider(node_14, {
						label: 'followSmoothTime',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(followSmoothTime);
						},

						set value($$value) {
							$.set(followSmoothTime, $$value, true);
						}
					});

					var node_15 = $.sibling(node_14, 2);

					Checkbox(node_15, {
						label: 'trackRotation',
						get value() {
							return $.get(trackRotation);
						},

						set value($$value) {
							$.set(trackRotation, $$value, true);
						}
					});

					var node_16 = $.sibling(node_15, 2);

					Slider(node_16, {
						label: 'trackRotationSmoothTime',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(trackRotationSmoothTime);
						},

						set value($$value) {
							$.set(trackRotationSmoothTime, $$value, true);
						}
					});

					var node_17 = $.sibling(node_16, 2);

					Slider(node_17, {
						label: 'trackRotationOffset',
						min: -Math.PI,
						max: Math.PI,
						step: 0.01,
						get value() {
							return $.get(trackRotationOffset);
						},

						set value($$value) {
							$.set(trackRotationOffset, $$value, true);
						}
					});

					var node_18 = $.sibling(node_17, 2);

					Checkbox(node_18, {
						label: 'following',
						get value() {
							return $.get(following);
						},

						set value($$value) {
							$.set(following, $$value, true);
						}
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_10, 2);

			Button(node_19, {
				title: 'Reset preset',
				$$events: { click: () => apply(presets[$.get(preset)]) }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_20 = $.child(div);

	Canvas(node_20, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get smoothTime() {
					return $.get(smoothTime);
				},

				get distance() {
					return $.get(distance);
				},

				get minPolarAngle() {
					return $.get(minPolarAngle);
				},

				get maxPolarAngle() {
					return $.get(maxPolarAngle);
				},

				get polarAngle() {
					return $.get(polarAngle);
				},

				get azimuthLocked() {
					return $.get(azimuthLocked);
				},

				get azimuthAngle() {
					return $.get(azimuthAngle);
				},

				get pointerLock() {
					return $.get(pointerLock);
				},

				get lookAtOffset() {
					return $.get(lookAtOffset);
				},

				get deadZone() {
					return $.get(deadZone);
				},

				get lookAhead() {
					return $.get(lookAhead);
				},

				get followSmoothTime() {
					return $.get(followSmoothTime);
				},

				get trackRotation() {
					return $.get(trackRotation);
				},

				get trackRotationSmoothTime() {
					return $.get(trackRotationSmoothTime);
				},

				get trackRotationOffset() {
					return $.get(trackRotationOffset);
				},

				get collision() {
					return $.get(collision);
				},

				get following() {
					return $.get(following);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}