import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeField, SelectField } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-cols-[1fr_1fr_auto] gap-2 my-2 screenshot-hidden"><!></div> <div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2"><!> <!> <!></div> <div class="grid grid-cols-2 gap-2 my-2"><!> <!></div>`, 1);

export default function GraticuleControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		stepX: 10,
		stepY: 10,
		projection: () => ({}),
		rotate: { yaw: 0, pitch: -30, roll: 20 }
	}));

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	SelectField(node, {
		label: 'Projections',
		get options() {
			return $$props.projections;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		get value() {
			return config().projection;
		},

		set value($$value) {
			config(config().projection = $$value, true);
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	RangeField(node_1, {
		label: 'Yaw',
		min: -360,
		max: 360,
		get value() {
			return config().rotate.yaw;
		},

		set value($$value) {
			config(config().rotate.yaw = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Pitch',
		min: -90,
		max: 90,
		get value() {
			return config().rotate.pitch;
		},

		set value($$value) {
			config(config().rotate.pitch = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	RangeField(node_3, {
		label: 'Roll',
		min: -180,
		max: 180,
		get value() {
			return config().rotate.roll;
		},

		set value($$value) {
			config(config().rotate.roll = $$value, true);
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.child(div_2);

	RangeField(node_4, {
		label: 'Step X',
		min: 0,
		max: 180,
		get value() {
			return config().stepX;
		},

		set value($$value) {
			config(config().stepX = $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	RangeField(node_5, {
		label: 'Step Y',
		min: 0,
		max: 180,
		get value() {
			return config().stepY;
		},

		set value($$value) {
			config(config().stepY = $$value, true);
		}
	});

	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}