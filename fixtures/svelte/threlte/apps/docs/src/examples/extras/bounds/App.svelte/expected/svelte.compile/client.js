import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Checkbox, List, Button, Wheel } from 'svelte-tweakpane-ui';
import { Suspense } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1yivz1x"><!></div>`, 1);

export default function App($$anchor) {
	let camera = $.state('perspective');
	let controls = $.state('orbit');
	let animate = $.state(true);
	let margin = $.state(1.5);
	let enabled = $.state(true);
	let version = $.state(0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			List(node_1, {
				label: 'camera',
				options: {
					OrthographicCamera: 'orthographic',
					PerspectiveCamera: 'perspective'
				},

				get value() {
					return $.get(camera);
				},

				set value($$value) {
					$.set(camera, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			List(node_2, {
				label: 'controls',
				options: {
					OrbitControls: 'orbit',
					CameraControls: 'camera',
					TrackballControls: 'trackball',
					None: 'none'
				},

				get value() {
					return $.get(controls);
				},

				set value($$value) {
					$.set(controls, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Wheel(node_3, {
				label: 'margin',
				step: 0.1,
				get value() {
					return $.get(margin);
				},

				set value($$value) {
					$.set(margin, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Checkbox(node_4, {
				label: 'animate',
				get value() {
					return $.get(animate);
				},

				set value($$value) {
					$.set(animate, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Checkbox(node_5, {
				label: 'enabled',
				get value() {
					return $.get(enabled);
				},

				set value($$value) {
					$.set(enabled, $$value, true);
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				title: 'Reset scene',
				$$events: { click: () => $.set(version, $.get(version) + 1) }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_7 = $.child(div);

	$.key(node_7, () => $.get(version), ($$anchor) => {
		Canvas($$anchor, {
			children: ($$anchor, $$slotProps) => {
				Suspense($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Scene($$anchor, {
							get camera() {
								return $.get(camera);
							},

							get controls() {
								return $.get(controls);
							},

							get margin() {
								return $.get(margin);
							},

							get animate() {
								return $.get(animate);
							},

							get enabled() {
								return $.get(enabled);
							}
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, fragment);
}