import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, Switch, TextField } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-flow-col gap-2 mb-1 screenshot-hidden"><!> <!> <!> <!></div> <div class="flex gap-2 mb-2"><!> <!></div>`, 1);

export default function ForceTextControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		text: 'LayerChart',
		fontSize: 124,
		spacing: 10,
		radius: 2,
		hasCollideForce: true,
		hasChargeForce: false
	}));

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	TextField(node, {
		label: 'Text',
		get value() {
			return config().text;
		},

		set value($$value) {
			config(config().text = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Font size (px)',
		max: 600,
		get value() {
			return config().fontSize;
		},

		set value($$value) {
			config(config().fontSize = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Spacing',
		get value() {
			return config().spacing;
		},

		set value($$value) {
			config(config().spacing = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => config().spacing * 2);

		RangeField(node_3, {
			label: 'Radius',
			min: 1,
			get max() {
				return $.get($0);
			},

			get value() {
				return config().radius;
			},

			set value($$value) {
				config(config().radius = $$value, true);
			}
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	Field(node_4, {
		label: 'Collide Force',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return config().hasCollideForce;
					},

					set checked($$value) {
						config(config().hasCollideForce = $$value, true);
					}
				});
			}
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'Charge Force',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return config().hasChargeForce;
					},

					set checked($$value) {
						config(config().hasChargeForce = $$value, true);
					}
				});
			}
		}
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}