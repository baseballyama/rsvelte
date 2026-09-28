import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, MenuField, Switch } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<div class="grid grid-cols-2 gap-2 mb-2 screenshot-hidden"><!> <!> <!> <!></div> <div class="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 screenshot-hidden"><!> <!> <!></div>`, 1);

export default function LinkControls($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 15, 'd3'),
		curve = $.prop($$props, 'curve', 15, undefined),
		sweep = $.prop($$props, 'sweep', 15, 'horizontal-vertical'),
		orientation = $.prop($$props, 'orientation', 15, 'horizontal'),
		radius = $.prop($$props, 'radius', 15, 60),
		bend = $.prop($$props, 'bend', 15, 22.5),
		showMiddle = $.prop($$props, 'showMiddle', 15, false);

	const typeOptions = ['d3', 'straight', 'square', 'beveled', 'rounded', 'swoop'].map((type) => ({ label: type, value: type }));
	const sweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((sweep) => ({ label: sweep, value: sweep }));

	const orientationOptions = [
		{ label: 'horizontal', value: 'horizontal' },
		{ label: 'vertical', value: 'vertical' }
	];

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	MenuField(node, {
		label: 'Link Type',
		get options() {
			return typeOptions;
		},
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return type();
		},

		set value($$value) {
			type($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			CurveMenuField($$anchor, {
				get value() {
					return curve();
				},

				set value($$value) {
					curve($$value);
				}
			});
		};

		$.if(node_1, ($$render) => {
			if (type() === 'd3') $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			RangeField($$anchor, {
				label: 'Radius',
				min: 0,
				get value() {
					return radius();
				},

				set value($$value) {
					radius($$value);
				}
			});
		};

		$.if(node_2, ($$render) => {
			if (type() === 'beveled' || type() === 'rounded') $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			RangeField($$anchor, {
				label: 'Bend (°)',
				min: -90,
				max: 90,
				get value() {
					return bend();
				},

				set value($$value) {
					bend($$value);
				}
			});
		};

		$.if(node_3, ($$render) => {
			if (type() === 'swoop') $$render(consequent_2);
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	{
		var consequent_3 = ($$anchor) => {
			MenuField($$anchor, {
				label: 'Orientation',
				get options() {
					return orientationOptions;
				},
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return orientation();
				},

				set value($$value) {
					orientation($$value);
				}
			});
		};

		$.if(node_4, ($$render) => {
			if (type() === 'd3') $$render(consequent_3);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	MenuField(node_5, {
		label: 'Link Sweep',
		get options() {
			return sweepOptions;
		},
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return sweep();
		},

		set value($$value) {
			sweep($$value);
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Field(node_6, {
		label: 'Middle',
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
						return showMiddle();
					},

					set checked($$value) {
						showMiddle($$value);
					}
				});
			}
		}
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}