import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MenuField } from 'svelte-ux';
import { curveLinear } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<div><!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function DagreControls($$anchor, $$props) {
	$.push($$props, true);

	let settings = $.prop($$props, 'settings', 31, () => $.proxy({
		ranker: 'network-simplex',
		direction: 'left-right',
		align: 'up-left',
		rankSeparation: 50,
		nodeSeparation: 50,
		edgeSeparation: 10,
		edgeLabelPosition: 'center',
		edgeLabelOffset: 10,
		curve: curveLinear,
		arrow: 'arrow'
	}));

	var div = root();
	var node = $.child(div);

	MenuField(node, {
		label: 'Ranker',
		options: [
			{ label: 'Network-Simplex', value: 'network-simplex' },
			{ label: 'Tight tree', value: 'tight-tree' },
			{ label: 'Longest path', value: 'longest-path' }
		],
		menuIcon: '',
		stepper: true,
		dense: true,
		get value() {
			return settings().ranker;
		},

		set value($$value) {
			settings(settings().ranker = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	MenuField(node_1, {
		label: 'Direction',
		options: [
			{ label: 'Top → Bottom', value: 'top-bottom' },
			{ label: 'Bottom → Top', value: 'bottom-top' },
			{ label: 'Left → Right', value: 'left-right' },
			{ label: 'Right → Left', value: 'right-left' }
		],
		menuIcon: '',
		stepper: true,
		dense: true,
		get value() {
			return settings().direction;
		},

		set value($$value) {
			settings(settings().direction = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	MenuField(node_2, {
		label: 'Align',
		options: [
			{ label: 'None', value: 'none' },
			{ label: 'Up / Left', value: 'up-left' },
			{ label: 'Up / Right', value: 'up-right' },
			{ label: 'Down / Left', value: 'down-left' },
			{ label: 'Down / Right', value: 'down-right' }
		],
		menuIcon: '',
		stepper: true,
		dense: true,
		get value() {
			return settings().align;
		},

		set value($$value) {
			settings(settings().align = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	MenuField(node_3, {
		label: 'Rank separation',
		options: [
			{ label: 'Compact', value: 10 },
			{ label: 'Default', value: 50 },
			{ label: 'Comfortable', value: 100 }
		],
		menuIcon: '',
		stepper: true,
		dense: true,
		get value() {
			return settings().rankSeparation;
		},

		set value($$value) {
			settings(settings().rankSeparation = $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	MenuField(node_4, {
		label: 'Node separation',
		options: [
			{ label: 'Compact', value: 10 },
			{ label: 'Default', value: 50 },
			{ label: 'Comfortable', value: 100 }
		],
		menuIcon: '',
		stepper: true,
		dense: true,
		get value() {
			return settings().nodeSeparation;
		},

		set value($$value) {
			settings(settings().nodeSeparation = $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	MenuField(node_5, {
		label: 'Edge separation',
		options: [
			{ label: 'Compact', value: 5 },
			{ label: 'Default', value: 10 },
			{ label: 'Comfortable', value: 20 }
		],
		menuIcon: '',
		stepper: true,
		dense: true,
		get value() {
			return settings().edgeSeparation;
		},

		set value($$value) {
			settings(settings().edgeSeparation = $$value, true);
		}
	});

	var node_6 = $.sibling(node_5, 2);

	MenuField(node_6, {
		label: 'Edge label position',
		options: [
			{ label: 'Left', value: 'left' },
			{ label: 'Center', value: 'center' },
			{ label: 'Right', value: 'right' }
		],
		menuIcon: '',
		stepper: true,
		dense: true,
		get value() {
			return settings().edgeLabelPosition;
		},

		set value($$value) {
			settings(settings().edgeLabelPosition = $$value, true);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	MenuField(node_7, {
		label: 'Edge label offset',
		options: [
			{ label: 'Compact', value: 5 },
			{ label: 'Default', value: 10 },
			{ label: 'Comfortable', value: 20 }
		],
		menuIcon: '',
		stepper: true,
		dense: true,
		get value() {
			return settings().edgeLabelOffset;
		},

		set value($$value) {
			settings(settings().edgeLabelOffset = $$value, true);
		}
	});

	var node_8 = $.sibling(node_7, 2);

	CurveMenuField(node_8, {
		label: 'Curve style',
		dense: true,
		get value() {
			return settings().curve;
		},

		set value($$value) {
			settings(settings().curve = $$value, true);
		}
	});

	var node_9 = $.sibling(node_8, 2);

	MenuField(node_9, {
		label: 'Arrow / Marker',
		options: [
			{ label: 'arrow', value: 'arrow' },
			{ label: 'triangle', value: 'triangle' },
			{ label: 'circle', value: 'circle' },
			{ label: 'circle-stroke', value: 'circle-stroke' },
			{ label: 'dot', value: 'dot' },
			{ label: 'line', value: 'line' }
		],
		menuIcon: '',
		stepper: true,
		dense: true,
		get value() {
			return settings().arrow;
		},

		set value($$value) {
			settings(settings().arrow = $$value, true);
		}
	});

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cls('grid gap-2 screenshot-hidden', $$props.class))
	]);

	$.append($$anchor, div);
	$.pop();
}