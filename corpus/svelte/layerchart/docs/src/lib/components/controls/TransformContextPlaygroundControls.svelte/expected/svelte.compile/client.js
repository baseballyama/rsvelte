import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, Switch } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<div class="grid grid-cols-[1fr_auto_auto] gap-2 mb-2 screenshot-hidden"><!> <!> <!></div> <div class="grid grid-cols-[1fr_1fr_auto] gap-2 mb-6 screenshot-hidden"><!> <!> <!></div>`, 1);

export default function TransformContextPlaygroundControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		pointCount: 500,
		angle: 137.5,
		showPoints: true,
		showPath: false,
		tweened: true,
		curve: undefined
	}));

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Angle',
		min: 1,
		max: 360,
		get value() {
			return config().angle;
		},

		set value($$value) {
			config(config().angle = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Tweened',
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
						return config().tweened;
					},

					set checked($$value) {
						config(config().tweened = $$value, true);
					}
				});
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Show path',
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
						return config().showPath;
					},

					set checked($$value) {
						config(config().showPath = $$value, true);
					}
				});
			}
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.child(div_1);

	RangeField(node_3, {
		label: 'Points',
		min: 1,
		max: 2000,
		get value() {
			return config().pointCount;
		},

		set value($$value) {
			config(config().pointCount = $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	CurveMenuField(node_4, {
		showOpenClosed: true,
		get value() {
			return config().curve;
		},

		set value($$value) {
			config(config().curve = $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'Show points',
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
						return config().showPoints;
					},

					set checked($$value) {
						config(config().showPoints = $$value, true);
					}
				});
			}
		}
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}