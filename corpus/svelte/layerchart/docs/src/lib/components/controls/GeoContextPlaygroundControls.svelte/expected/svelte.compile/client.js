import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, SelectField, Switch } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-cols-[1fr_1fr_auto] gap-2 my-2 screenshot-hidden"><!> <!> <!></div> <div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2"><!> <!> <!></div>`, 1);

export default function GeoContextPlaygroundControls($$anchor, $$props) {
	$.push($$props, true);

	let projection = $.prop($$props, 'projection', 15),
		scale = $.prop($$props, 'scale', 15),
		detailed = $.prop($$props, 'detailed', 15),
		rotate = $.prop($$props, 'rotate', 15);

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
			return projection();
		},

		set value($$value) {
			projection($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Scale',
		min: -100,
		max: 3000,
		get value() {
			return scale();
		},

		set value($$value) {
			scale($$value);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Detail',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},

					get checked() {
						return detailed();
					},

					set checked($$value) {
						detailed($$value);
					}
				});
			}
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.child(div_1);

	RangeField(node_3, {
		label: 'Yaw',
		min: -360,
		max: 360,
		get value() {
			return rotate().yaw;
		},

		set value($$value) {
			rotate(rotate().yaw = $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	RangeField(node_4, {
		label: 'Pitch',
		min: -90,
		max: 90,
		get value() {
			return rotate().pitch;
		},

		set value($$value) {
			rotate(rotate().pitch = $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	RangeField(node_5, {
		label: 'Roll',
		min: -180,
		max: 180,
		get value() {
			return rotate().roll;
		},

		set value($$value) {
			rotate(rotate().roll = $$value, true);
		}
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}