import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, List, Checkbox, ThemeUtils } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);

export default function Settings($$anchor, $$props) {
	$.push($$props, true);

	let controls = $.prop($$props, 'controls', 15, '<OrbitControls>'),
		autoPauseControls = $.prop($$props, 'autoPauseControls', 15, true);

	Pane($$anchor, {
		get theme() {
			return ThemeUtils.presets.light;
		},
		position: 'fixed',
		title: 'TransformControls',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			List(node, {
				label: 'Camera Controls',
				options: {
					'<OrbitControls>': '<OrbitControls>',
					'<TrackballControls>': '<TrackballControls>',
					'<CameraControls>': '<CameraControls>'
				},

				get value() {
					return controls();
				},

				set value($$value) {
					controls($$value);
				}
			});

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, {
				label: 'autoPauseControls',
				get value() {
					return autoPauseControls();
				},

				set value($$value) {
					autoPauseControls($$value);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}