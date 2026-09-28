import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeField, MenuField } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-flow-col gap-1 mb-4 screenshot-hidden"><!> <!> <!> <!> <!></div>`);

export default function SankeyControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 15);
	var div = root();
	var node = $.child(div);

	MenuField(node, {
		label: 'Align',
		options: [
			{ label: 'justify', value: 'justify' },
			{ label: 'left', value: 'left' },
			{ label: 'center', value: 'center' },
			{ label: 'right', value: 'right' }
		],

		get value() {
			return config().nodeAlign;
		},

		set value($$value) {
			config(config().nodeAlign = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	MenuField(node_1, {
		label: 'Node color',
		options: [
			{ label: 'layer', value: 'layer' },
			{ label: 'depth', value: 'depth' },
			{ label: 'height', value: 'height' },
			{ label: 'index', value: 'index' }
		],

		get value() {
			return config().nodeColorBy;
		},

		set value($$value) {
			config(config().nodeColorBy = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	MenuField(node_2, {
		label: 'Link color',
		options: [
			{ label: 'static', value: 'static' },
			{ label: 'source', value: 'source' },
			{ label: 'target', value: 'target' }
		],

		get value() {
			return config().linkColorBy;
		},

		set value($$value) {
			config(config().linkColorBy = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	RangeField(node_3, {
		label: 'Node Padding',
		max: 20,
		class: 'col-span-2',
		get value() {
			return config().nodePadding;
		},

		set value($$value) {
			config(config().nodePadding = $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	RangeField(node_4, {
		label: 'Node Width',
		max: 20,
		get value() {
			return config().nodeWidth;
		},

		set value($$value) {
			config(config().nodeWidth = $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}