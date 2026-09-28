import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-2 screenshot-hidden"><!> <!></div>`);

export default function GeoPointControls($$anchor, $$props) {
	$.push($$props, true);

	let tooltipMode = $.prop($$props, 'tooltipMode', 15),
		tooltipRadius = $.prop($$props, 'tooltipRadius', 15);

	var div = root_1();
	var node = $.child(div);

	Field(node, {
		label: 'Tooltip mode',
		class: 'grow',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				get value() {
					return tooltipMode();
				},

				set value($$value) {
					tooltipMode($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					ToggleOption(node_1, {
						value: 'quadtree',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('quadtree');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: 'voronoi',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('voronoi');

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

	RangeField(node_3, {
		label: 'Tooltip radius',
		max: 100,
		class: 'grow',
		get value() {
			return tooltipRadius();
		},

		set value($$value) {
			tooltipRadius($$value);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}