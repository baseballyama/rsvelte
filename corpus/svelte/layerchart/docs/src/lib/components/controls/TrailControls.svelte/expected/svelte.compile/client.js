import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Field,
	MenuField,
	RangeField,
	Switch,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
import ShowField from './fields/ShowField.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 screenshot-hidden"><!> <!> <!> <!> <!></div>`);

export default function TrailControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		show: false,
		pathGenerator: (x) => x,
		amplitude: 1,
		frequency: 10,
		phase: 0,
		curve: undefined,
		cap: 'round',
		pointCount: 30,
		showLine: false,
		motion: undefined
	}));

	var div = root_2();
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

	MenuField(node_3, {
		label: 'Cap',
		options: [
			{ label: 'round', value: 'round' },
			{ label: 'butt', value: 'butt' }
		],
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return config().cap;
		},

		set value($$value) {
			config(config().cap = $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var node_5 = $.first_child(fragment);

			Field(node_5, {
				label: 'Show line',
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
								return config().showLine;
							},

							set checked($$value) {
								config(config().showLine = $$value, true);
							}
						});
					}
				}
			});

			var node_6 = $.sibling(node_5, 2);

			RangeField(node_6, {
				label: 'Points',
				min: 2,
				get value() {
					return config().pointCount;
				},

				set value($$value) {
					config(config().pointCount = $$value, true);
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Field(node_7, {
				label: 'Motion',
				classes: { input: 'mt-1 mb-[6px]' },
				children: ($$anchor, $$slotProps) => {
					ToggleGroup($$anchor, {
						variant: 'outline',
						size: 'sm',
						get value() {
							return config().motion;
						},

						set value($$value) {
							config(config().motion = $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_8 = $.first_child(fragment_3);

							ToggleOption(node_8, {
								value: 'none',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('none');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							ToggleOption(node_9, {
								value: 'tween',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('tween');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		};

		$.if(node_4, ($$render) => {
			if (config().motion !== undefined) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}