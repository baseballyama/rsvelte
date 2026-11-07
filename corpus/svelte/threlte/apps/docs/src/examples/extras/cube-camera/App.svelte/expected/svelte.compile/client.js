import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene, { hdrs } from './Scene.svelte';
import { Checkbox, Folder, List, Pane, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="svelte-rwuya5"><!></div>`, 1);

export default function App($$anchor) {
	const resolutionOptions = { 32: 32, 64: 64, 128: 128, 256: 256, 512: 512, 1024: 1024 };

	const environmentOptions = {
		auto: 'auto',
		industrial: 'industrial',
		puresky: 'puresky',
		workshop: 'workshop'
	};

	let hdr = $.state('auto');
	let metalness = $.state(1);
	let resolution = $.state(256);
	let roughness = $.state(0);
	let capFrames = $.state(false);
	let frames = $.derived(() => $.get(capFrames) ? 3 : Infinity);
	let near = $.state(0.1);
	let far = $.state(1000);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'fixed',
		title: '',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			List(node_1, {
				label: 'resolution',
				get options() {
					return resolutionOptions;
				},

				get value() {
					return $.get(resolution);
				},

				set value($$value) {
					$.set(resolution, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			List(node_2, {
				label: 'environment',
				get options() {
					return environmentOptions;
				},

				get value() {
					return $.get(hdr);
				},

				set value($$value) {
					$.set(hdr, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Checkbox(node_3, {
				label: 'cap frames',
				get value() {
					return $.get(capFrames);
				},

				set value($$value) {
					$.set(capFrames, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'near',
				max: 15,
				min: 0.1,
				get value() {
					return $.get(near);
				},

				set value($$value) {
					$.set(near, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Slider(node_5, {
				label: 'far',
				max: 2000,
				min: 10,
				get value() {
					return $.get(far);
				},

				set value($$value) {
					$.set(far, $$value, true);
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Folder(node_6, {
				title: 'material props',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_7 = $.first_child(fragment_2);

					Slider(node_7, {
						max: 1,
						min: 0,
						step: 0.1,
						label: 'metalness',
						get value() {
							return $.get(metalness);
						},

						set value($$value) {
							$.set(metalness, $$value, true);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					Slider(node_8, {
						max: 1,
						min: 0,
						step: 0.1,
						label: 'roughness',
						get value() {
							return $.get(roughness);
						},

						set value($$value) {
							$.set(roughness, $$value, true);
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

	var div = $.sibling(node, 2);
	var node_9 = $.child(div);

	Canvas(node_9, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get frames() {
					return $.get(frames);
				},

				get hdr() {
					return $.get(hdr);
				},

				get metalness() {
					return $.get(metalness);
				},

				get near() {
					return $.get(near);
				},

				get far() {
					return $.get(far);
				},

				get resolution() {
					return $.get(resolution);
				},

				get roughness() {
					return $.get(roughness);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}