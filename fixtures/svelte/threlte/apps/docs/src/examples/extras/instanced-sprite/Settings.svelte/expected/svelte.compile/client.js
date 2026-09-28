import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Pane, Slider, ThemeUtils } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!>`, 1);

export default function Settings($$anchor, $$props) {
	$.push($$props, true);

	let billboarding = $.prop($$props, 'billboarding', 15),
		fps = $.prop($$props, 'fps', 15);

	Pane($$anchor, {
		get theme() {
			return ThemeUtils.presets.light;
		},
		position: 'fixed',
		title: 'InstancedSprite',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, {
				label: 'billboarding',
				get value() {
					return billboarding();
				},

				set value($$value) {
					billboarding($$value);
				}
			});

			var node_1 = $.sibling(node, 2);

			Slider(node_1, {
				label: 'fps',
				min: 1,
				max: 30,
				step: 1,
				get value() {
					return fps();
				},

				set value($$value) {
					fps($$value);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}