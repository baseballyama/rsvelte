import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, Switch, TextField } from 'svelte-ux';
import ShowField from './fields/ShowField.svelte';

var root = $.from_html(`<div class="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 mb-2 screenshot-hidden"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function ArcPlaygroundControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		show: false,
		value: 60,
		spring: true,
		domain: [0, 100],
		range: [-90, 90],
		innerRadius: 70,
		outerRadius: 140,
		cornerRadius: 8,
		padAngle: 0,
		outerText: 'outer text',
		innerText: 'inner text',
		centroidText: 'centroid text',
		textSize: 16
	}));

	var div = root();
	var node = $.child(div);

	RangeField(node, {
		label: 'Value',
		get min() {
			return config().domain[0];
		},

		get max() {
			return config().domain[1];
		},
		class: 'col-span-2',
		get value() {
			return config().value;
		},

		set value($$value) {
			config(config().value = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	ShowField(node_1, {
		inline: true,
		get show() {
			return config().show;
		},

		set show($$value) {
			config(config().show = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Use spring',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},

					get checked() {
						return config().spring;
					},

					set checked($$value) {
						config(config().spring = $$value, true);
					}
				});
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	RangeField(node_3, {
		label: 'Domain Min',
		get max() {
			return config().domain[1];
		},

		get value() {
			return config().domain[0];
		},

		set value($$value) {
			config(config().domain[0] = $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	RangeField(node_4, {
		label: 'Domain Max',
		max: 1000,
		get value() {
			return config().domain[1];
		},

		set value($$value) {
			config(config().domain[1] = $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	RangeField(node_5, {
		label: 'Range Min (degrees)',
		min: -360,
		max: 360,
		get value() {
			return config().range[0];
		},

		set value($$value) {
			config(config().range[0] = $$value, true);
		}
	});

	var node_6 = $.sibling(node_5, 2);

	RangeField(node_6, {
		label: 'Range Max (degrees)',
		min: -360,
		max: 360,
		get value() {
			return config().range[1];
		},

		set value($$value) {
			config(config().range[1] = $$value, true);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	RangeField(node_7, {
		label: 'Inner radius',
		get max() {
			return config().outerRadius;
		},

		get value() {
			return config().innerRadius;
		},

		set value($$value) {
			config(config().innerRadius = $$value, true);
		}
	});

	var node_8 = $.sibling(node_7, 2);

	RangeField(node_8, {
		label: 'Outer radius',
		get min() {
			return config().innerRadius;
		},
		max: 200,
		get value() {
			return config().outerRadius;
		},

		set value($$value) {
			config(config().outerRadius = $$value, true);
		}
	});

	var node_9 = $.sibling(node_8, 2);

	{
		let $0 = $.derived(() => (config().outerRadius - config().innerRadius) / 2);

		RangeField(node_9, {
			label: 'Corner radius',
			get max() {
				return $.get($0);
			},

			get value() {
				return config().cornerRadius;
			},

			set value($$value) {
				config(config().cornerRadius = $$value, true);
			}
		});
	}

	var node_10 = $.sibling(node_9, 2);

	RangeField(node_10, {
		label: 'Pad angle',
		max: 2,
		step: 0.1,
		get value() {
			return config().padAngle;
		},

		set value($$value) {
			config(config().padAngle = $$value, true);
		}
	});

	var node_11 = $.sibling(node_10, 2);

	TextField(node_11, {
		label: 'Outer Arc Text',
		get value() {
			return config().outerText;
		},

		set value($$value) {
			config(config().outerText = $$value, true);
		}
	});

	var node_12 = $.sibling(node_11, 2);

	TextField(node_12, {
		label: 'Inner Arc Text',
		get value() {
			return config().innerText;
		},

		set value($$value) {
			config(config().innerText = $$value, true);
		}
	});

	var node_13 = $.sibling(node_12, 2);

	TextField(node_13, {
		label: 'Centroid Arc Text',
		get value() {
			return config().centroidText;
		},

		set value($$value) {
			config(config().centroidText = $$value, true);
		}
	});

	var node_14 = $.sibling(node_13, 2);

	RangeField(node_14, {
		label: 'Font size (px)',
		get min() {
			return config().domain[0];
		},

		get max() {
			return config().domain[1];
		},

		get value() {
			return config().textSize;
		},

		set value($$value) {
			config(config().textSize = $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}