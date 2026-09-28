import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Element, Pane, ThemeUtils } from '$lib';

var root = $.from_html(`<br/>`);
var root_1 = $.from_html(` <!> <!> <hr/> <!> <!> <!> <hr/> <!>  <!> <!> <hr/> <!>`, 1);

export default function TestCollapseExpand($$anchor, $$props) {
	$.push($$props, true);

	let expanded = false;

	$.next();

	var fragment = root_1();
	var text = $.first_child(fragment);
	var node = $.sibling(text);

	// Related to https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/4
	Pane(node, {
		expanded: false,
		position: 'draggable',
		storePositionLocally: false,
		title: 'Draggable Pane Unbound Literal',
		x: 8,
		y: 300,
		children: ($$anchor, $$slotProps) => {
			Element($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var br = root();

					$.append($$anchor, br);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Pane(node_1, {
		expanded: false,
		position: 'fixed',
		title: 'Fixed Pane Unbound Literal',
		x: 8,
		y: 400,
		children: ($$anchor, $$slotProps) => {
			Element($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var br_1 = root();

					$.append($$anchor, br_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Pane(node_2, {
		expanded: false,
		position: 'inline',
		title: 'Inline Pane Unbound Literal',
		children: ($$anchor, $$slotProps) => {
			Element($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var br_2 = root();

					$.append($$anchor, br_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Pane(node_3, {
		get expanded() {
			return expanded;
		},
		position: 'draggable',
		storePositionLocally: false,
		title: 'Draggable Pane Unbound Variable',
		x: 300,
		y: 300,
		children: ($$anchor, $$slotProps) => {
			Element($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var br_3 = root();

					$.append($$anchor, br_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Pane(node_4, {
		get expanded() {
			return expanded;
		},
		position: 'fixed',
		title: 'Fixed Pane Unbound Variable',
		x: 300,
		y: 400,
		children: ($$anchor, $$slotProps) => {
			Element($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var br_4 = root();

					$.append($$anchor, br_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Pane(node_5, {
		get expanded() {
			return expanded;
		},
		position: 'inline',
		get theme() {
			return ThemeUtils.presets.light;
		},
		title: 'Inline Pane Unbound Variable',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'Expanded',
				get value() {
					return expanded;
				},

				set value($$value) {
					expanded = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Pane(node_6, {
		position: 'draggable',
		storePositionLocally: false,
		get theme() {
			return ThemeUtils.presets.light;
		},
		title: 'Draggable Pane Bound Variable',
		x: 600,
		y: 300,
		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'Expanded',
				get value() {
					return expanded;
				},

				set value($$value) {
					expanded = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Pane(node_7, {
		position: 'fixed',
		get theme() {
			return ThemeUtils.presets.light;
		},
		title: 'Fixed Pane Bound Variable',
		x: 600,
		y: 400,
		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'Expanded',
				get value() {
					return expanded;
				},

				set value($$value) {
					expanded = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Pane(node_8, {
		position: 'inline',
		get theme() {
			return ThemeUtils.presets.light;
		},
		title: 'Inline Pane Bound Variable',
		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'Expanded',
				get value() {
					return expanded;
				},

				set value($$value) {
					expanded = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	$.template_effect(() => $.set_text(text, `${expanded ?? ''} `));
	$.append($$anchor, fragment);
	$.pop();
}