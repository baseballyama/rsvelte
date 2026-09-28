import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Pane, ThemeUtils, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Settings($$anchor, $$props) {
	$.push($$props, true);

	let staticMoving = $.prop($$props, 'staticMoving', 15),
		noRotate = $.prop($$props, 'noRotate', 15),
		rotateSpeed = $.prop($$props, 'rotateSpeed', 15),
		noZoom = $.prop($$props, 'noZoom', 15),
		zoomSpeed = $.prop($$props, 'zoomSpeed', 15),
		noPan = $.prop($$props, 'noPan', 15),
		panSpeed = $.prop($$props, 'panSpeed', 15);

	Pane($$anchor, {
		get theme() {
			return ThemeUtils.presets.light;
		},
		position: 'fixed',
		title: 'TrackballControls',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, {
				label: 'staticMoving',
				get value() {
					return staticMoving();
				},

				set value($$value) {
					staticMoving($$value);
				}
			});

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, {
				label: 'noRotate',
				get value() {
					return noRotate();
				},

				set value($$value) {
					noRotate($$value);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'noPan',
				get value() {
					return noPan();
				},

				set value($$value) {
					noPan($$value);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Checkbox(node_3, {
				label: 'noZoom',
				get value() {
					return noZoom();
				},

				set value($$value) {
					noZoom($$value);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'rotateSpeed',
				min: 0.1,
				max: 2,
				step: 0.1,
				get value() {
					return rotateSpeed();
				},

				set value($$value) {
					rotateSpeed($$value);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Slider(node_5, {
				label: 'panSpeed',
				min: 0.05,
				max: 1.0,
				step: 0.05,
				get value() {
					return panSpeed();
				},

				set value($$value) {
					panSpeed($$value);
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Slider(node_6, {
				label: 'zoomSpeed',
				min: 0.1,
				max: 2,
				step: 0.1,
				get value() {
					return zoomSpeed();
				},

				set value($$value) {
					zoomSpeed($$value);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}