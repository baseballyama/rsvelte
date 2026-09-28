import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, Switch } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
import ShowField from '$lib/components/controls/fields/ShowField.svelte';

var root = $.from_html(`<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-4 screenshot-hidden"><!> <!> <!> <!></div>`);

export default function MotionPathControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		pointCount: 100,
		pathGenerator: (x) => x,
		curve: undefined,
		amplitude: 1,
		frequency: 10,
		phase: 0,
		show: false,
		duration: '5s',
		repeatCount: 'indefinite',
		start: undefined
	}));

	var div = root();
	var node = $.child(div);

	ShowField(node, {
		inline: true,
		get show() {
			return config().show;
		},

		set show($$value) {
			config(config().show = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	PathDataMenuField(node_1, {
		get amplitude() {
			return config().amplitude;
		},

		get frequency() {
			return config().frequency;
		},

		get phase() {
			return config().phase;
		},

		get value() {
			return config().pathGenerator;
		},

		set value($$value) {
			config(config().pathGenerator = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	CurveMenuField(node_2, {
		get value() {
			return config().curve;
		},

		set value($$value) {
			config(config().curve = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	RangeField(node_3, {
		label: 'Points',
		min: 2,
		get value() {
			return config().pointCount;
		},

		set value($$value) {
			config(config().pointCount = $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}