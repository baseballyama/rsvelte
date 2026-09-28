import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Text } from '$lib';

var root = $.from_html(`<a href="https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/1">Issue #1</a> <!> <!>`, 1);

export default function TestTitlelessDraggable($$anchor) {
	let title = '';
	let title2 = 'Title';
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	Pane(node, {
		position: 'draggable',
		get title() {
			return title;
		},
		x: 10,
		y: 150,
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				label: 'Pane Title',
				get value() {
					return title;
				},

				set value($$value) {
					title = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Pane(node_1, {
		localStoreId: 'B',
		position: 'draggable',
		get title() {
			return title2;
		},
		x: 10,
		y: 220,
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				label: 'Pane Title',
				get value() {
					return title2;
				},

				set value($$value) {
					title2 = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}