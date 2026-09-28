import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Folder, Pane } from '$lib';

var root = $.from_html(`<!> <!>`, 1);

export default function TestInvisibleFolder($$anchor) {
	let expanded = true;
	let darkMode = true;
	let numbers = true;

	Pane($$anchor, {
		title: '',
		userExpandable: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, {
				label: 'Expanded',
				get value() {
					return expanded;
				},

				set value($$value) {
					expanded = $$value;
				}
			});

			var node_1 = $.sibling(node, 2);

			Folder(node_1, {
				get expanded() {
					return expanded;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Checkbox(node_2, {
						label: 'Dark Mode',
						get value() {
							return darkMode;
						},

						set value($$value) {
							darkMode = $$value;
						}
					});

					var node_3 = $.sibling(node_2, 2);

					Checkbox(node_3, {
						label: 'Numbers',
						get value() {
							return numbers;
						},

						set value($$value) {
							numbers = $$value;
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
}