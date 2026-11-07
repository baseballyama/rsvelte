import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Pane, ThemeUtils, Slider } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Settings($$anchor, $$props) {
	$.push($$props, true);

	let autoRotate = $.prop($$props, 'autoRotate', 15),
		enableDamping = $.prop($$props, 'enableDamping', 15),
		rotateSpeed = $.prop($$props, 'rotateSpeed', 15),
		zoomToCursor = $.prop($$props, 'zoomToCursor', 15),
		zoomSpeed = $.prop($$props, 'zoomSpeed', 15),
		minPolarAngle = $.prop($$props, 'minPolarAngle', 15),
		maxPolarAngle = $.prop($$props, 'maxPolarAngle', 15),
		enableZoom = $.prop($$props, 'enableZoom', 15);

	Pane($$anchor, {
		get theme() {
			return ThemeUtils.presets.light;
		},
		position: 'fixed',
		title: 'OrbitControls',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, {
				label: 'autoRotate',
				get value() {
					return autoRotate();
				},

				set value($$value) {
					autoRotate($$value);
				}
			});

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, {
				label: 'enableDamping',
				get value() {
					return enableDamping();
				},

				set value($$value) {
					enableDamping($$value);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'enableZoom',
				get value() {
					return enableZoom();
				},

				set value($$value) {
					enableZoom($$value);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Checkbox(node_3, {
				label: 'zoomToCursor',
				get value() {
					return zoomToCursor();
				},

				set value($$value) {
					zoomToCursor($$value);
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

			var node_6 = $.sibling(node_5, 2);

			Slider(node_6, {
				label: 'minPolarAngle',
				min: 0,
				max: Math.PI,
				step: 0.1,
				get value() {
					return minPolarAngle();
				},

				set value($$value) {
					minPolarAngle($$value);
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Slider(node_7, {
				label: 'maxPolarAngle',
				min: 0,
				max: Math.PI,
				step: 0.1,
				get value() {
					return maxPolarAngle();
				},

				set value($$value) {
					maxPolarAngle($$value);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}