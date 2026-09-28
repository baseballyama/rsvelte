import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, SelectField, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-2 gap-2 my-2 screenshot-hidden"><!> <!> <!> <!> <!> <!></div>`);

export default function GeoCirclePlaygroundControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
			example: 'single',
			projection: null,
			latitude: 0,
			longitude: 0,
			radius: 600,
			precision: 6
		})),
		projections = $.prop($$props, 'projections', 19, () => []);

	var div = root_1();
	var node = $.child(div);

	Field(node, {
		label: 'Example',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				inset: true,
				class: 'w-full',
				size: 'sm',
				get value() {
					return config().example;
				},

				set value($$value) {
					config(config().example = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					ToggleOption(node_1, {
						value: 'single',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Single');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: 'multi',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Multi');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	SelectField(node_3, {
		label: 'Projections',
		get options() {
			return projections();
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

	var node_4 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => config().example != 'single');

		RangeField(node_4, {
			label: 'Latitude',
			min: -90,
			max: 90,
			get disabled() {
				return $.get($0);
			},

			get value() {
				return config().latitude;
			},

			set value($$value) {
				config(config().latitude = $$value, true);
			}
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => config().example != 'single');

		RangeField(node_5, {
			label: 'Longitude',
			min: -180,
			max: 180,
			get disabled() {
				return $.get($0);
			},

			get value() {
				return config().longitude;
			},

			set value($$value) {
				config(config().longitude = $$value, true);
			}
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		let $0 = $.derived(() => config().example != 'single');

		RangeField(node_6, {
			label: 'Radius (km)',
			max: 6371,
			get disabled() {
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

	var node_7 = $.sibling(node_6, 2);

	{
		let $0 = $.derived(() => config().example != 'single');

		RangeField(node_7, {
			label: 'Precision',
			max: 90,
			get disabled() {
				return $.get($0);
			},

			get value() {
				return config().precision;
			},

			set value($$value) {
				config(config().precision = $$value, true);
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}