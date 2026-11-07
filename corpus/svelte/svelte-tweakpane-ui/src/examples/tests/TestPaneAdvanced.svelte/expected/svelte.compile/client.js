import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { Pane, Slider } from '$lib';
import Checkbox from '$lib/control/Checkbox.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function TestPaneAdvanced($$anchor, $$props) {
	$.push($$props, true);

	let tpPane1;
	let tpPane2;
	let tpPane3;
	let expanded = true;
	let userExpandable = true;

	onMount(() => {
		// Have your way with the pane...
		console.log('tpPane1:', tpPane1);

		tpPane1.on('change', (event) => {
			console.log('tpPane1');
			console.log(event);
		});

		console.log('tpPane2:', tpPane2);

		tpPane2.on('change', (event) => {
			console.log('tpPane2');
			console.log(event);
		});

		console.log('tpPane3:', tpPane3);

		tpPane3.on('change', (event) => {
			console.log('tpPane3');
			console.log(event);
		});
	});

	let speed = 50;
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		position: 'draggable',
		get userExpandable() {
			return userExpandable;
		},

		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		get tpPane() {
			return tpPane1;
		},

		set tpPane($$value) {
			tpPane1 = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'expanded',
				get value() {
					return expanded;
				},

				set value($$value) {
					expanded = $$value;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, {
				label: 'user expandable',
				get value() {
					return userExpandable;
				},

				set value($$value) {
					userExpandable = $$value;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				max: 100,
				min: 0,
				get value() {
					return speed;
				},

				set value($$value) {
					speed = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Pane(node_4, {
		position: 'inline',
		get userExpandable() {
			return userExpandable;
		},

		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		get tpPane() {
			return tpPane2;
		},

		set tpPane($$value) {
			tpPane2 = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, {
				max: 100,
				min: 0,
				get value() {
					return speed;
				},

				set value($$value) {
					speed = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Pane(node_5, {
		position: 'fixed',
		get userExpandable() {
			return userExpandable;
		},

		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		get tpPane() {
			return tpPane3;
		},

		set tpPane($$value) {
			tpPane3 = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, {
				max: 100,
				min: 0,
				get value() {
					return speed;
				},

				set value($$value) {
					speed = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}