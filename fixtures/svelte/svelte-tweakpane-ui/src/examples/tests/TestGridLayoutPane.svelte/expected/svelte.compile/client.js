import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Pane, Slider } from '$lib';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="layout-wrapper svelte-yzcc6p"></div> <!>`, 1);

export default function TestGridLayoutPane($$anchor) {
	let colors = 0.95;
	let darkMode = true;
	let numbers = true;
	let oneMore = true;
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	Pane(node, {
		position: 'inline',
		theme: { bladeValueWidth: '244px' },
		width: 337,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Slider(node_1, {
				label: 'Colors',
				max: 1,
				min: 0,
				get value() {
					return colors;
				},

				set value($$value) {
					colors = $$value;
				}
			});

			var node_2 = $.sibling(node_1, 2);

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

			var node_4 = $.sibling(node_3, 2);

			Checkbox(node_4, {
				label: 'One More',
				get value() {
					return oneMore;
				},

				set value($$value) {
					oneMore = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}