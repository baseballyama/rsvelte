import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeField } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-cols-xs gap-2 mb-2 screenshot-hidden"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function PolygonPlaygroundControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		points: 8,
		cornerRadius: 0,
		inset: 0,
		rotate: 0,
		scaleX: 1,
		scaleY: 1,
		skewX: 0,
		skewY: 0,
		tiltX: 0,
		tiltY: 0
	}));

	var div = root();
	var node = $.child(div);

	RangeField(node, {
		label: 'points',
		min: 3,
		max: 20,
		get value() {
			return config().points;
		},

		set value($$value) {
			config(config().points = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'inset',
		min: -1,
		max: 1,
		step: 0.1,
		format: 'decimal',
		get value() {
			return config().inset;
		},

		set value($$value) {
			config(config().inset = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'rotate',
		max: 360,
		get value() {
			return config().rotate;
		},

		set value($$value) {
			config(config().rotate = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	RangeField(node_3, {
		label: 'cornerRadius',
		max: 50,
		get value() {
			return config().cornerRadius;
		},

		set value($$value) {
			config(config().cornerRadius = $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	RangeField(node_4, {
		label: 'scaleX',
		min: -2,
		max: 2,
		step: 0.1,
		format: 'decimal',
		get value() {
			return config().scaleX;
		},

		set value($$value) {
			config(config().scaleX = $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	RangeField(node_5, {
		label: 'scaleY',
		min: -2,
		max: 2,
		step: 0.1,
		format: 'decimal',
		get value() {
			return config().scaleY;
		},

		set value($$value) {
			config(config().scaleY = $$value, true);
		}
	});

	var node_6 = $.sibling(node_5, 2);

	RangeField(node_6, {
		label: 'skewX',
		min: -50,
		max: 50,
		get value() {
			return config().skewX;
		},

		set value($$value) {
			config(config().skewX = $$value, true);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	RangeField(node_7, {
		label: 'skewY',
		min: -50,
		max: 50,
		get value() {
			return config().skewY;
		},

		set value($$value) {
			config(config().skewY = $$value, true);
		}
	});

	var node_8 = $.sibling(node_7, 2);

	RangeField(node_8, {
		label: 'tiltX',
		min: -2,
		max: 2,
		step: 0.1,
		format: 'decimal',
		get value() {
			return config().tiltX;
		},

		set value($$value) {
			config(config().tiltX = $$value, true);
		}
	});

	var node_9 = $.sibling(node_8, 2);

	RangeField(node_9, {
		label: 'tiltY',
		min: -2,
		max: 2,
		step: 0.1,
		format: 'decimal',
		get value() {
			return config().tiltY;
		},

		set value($$value) {
			config(config().tiltY = $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}