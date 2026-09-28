import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioButton, RadioButtonGroup, Theme } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ThemePersist($$anchor) {
	let theme = "g90";
	var fragment = root();
	var node = $.first_child(fragment);

	Theme(node, {
		persist: true,
		persistKey: '__carbon-theme',
		get theme() {
			return theme;
		},

		set theme($$value) {
			theme = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	RadioButtonGroup(node_1, {
		legendText: 'Carbon theme',
		get selected() {
			return theme;
		},

		set selected($$value) {
			theme = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 16, () => ["white", "g10", "g80", "g90", "g100"], $.index, ($$anchor, value) => {
				RadioButton($$anchor, {
					get labelText() {
						return value;
					},

					get value() {
						return value;
					}
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}