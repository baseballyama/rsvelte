import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MenuField, MultiSelectField } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<div><!> <!> <!> <!></div>`);

export default function TooltipContextControls($$anchor, $$props) {
	$.push($$props, true);

	let settings = $.prop($$props, 'settings', 15);
	var div = root();
	var node = $.child(div);

	MenuField(node, {
		label: 'Mode',
		options: [
			{ label: 'bisect-x', value: 'bisect-x' },
			{ label: 'bisect-y', value: 'bisect-y' },
			{ label: 'bisect-band', value: 'bisect-band' },
			{ label: 'band', value: 'band' },
			{ label: 'bounds', value: 'bounds' },
			{ label: 'voronoi', value: 'voronoi' },
			{ label: 'quadtree', value: 'quadtree' },
			{ label: 'quadtree-x', value: 'quadtree-x' },
			{ label: 'quadtree-y', value: 'quadtree-y' }
		],

		get value() {
			return settings().mode;
		},

		set value($$value) {
			settings(settings().mode = $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	MultiSelectField(node_1, {
		label: 'Highlight',
		options: [
			{ label: 'points', value: 'points' },
			{ label: 'lines', value: 'lines' },
			{ label: 'area', value: 'area' },
			{ label: 'bar', value: 'bar' }
		],
		formatSelected: ({ options }) => options.map((x) => x.label).join(', '),
		get value() {
			return settings().highlight;
		},

		set value($$value) {
			settings(settings().highlight = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	MenuField(node_2, {
		label: 'Highlight axis',
		options: [
			{ label: 'default', value: null },
			{ label: 'x', value: 'x' },
			{ label: 'y', value: 'y' },
			{ label: 'both', value: 'both' },
			{ label: 'none', value: 'none' }
		],

		get value() {
			return settings().axis;
		},

		set value($$value) {
			settings(settings().axis = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => settings().snapToDataX && settings().snapToDataY
			? 'both'
			: settings().snapToDataX ? 'x-only' : settings().snapToDataY ? 'y-only' : 'off');

		MenuField(node_3, {
			label: 'Snap to Data',
			get value() {
				return $.get($0);
			},

			options: [
				{ label: 'off', value: 'off' },
				{ label: 'x-only', value: 'x-only' },
				{ label: 'y-only', value: 'y-only' },
				{ label: 'both', value: 'both' }
			],
			$$events: {
				change: (e) => {
					switch (e.detail.value) {
						case 'off':
							settings(settings().snapToDataX = false, true);
							settings(settings().snapToDataY = false, true);
							break;

						case 'x-only':
							settings(settings().snapToDataX = true, true);
							settings(settings().snapToDataY = false, true);
							break;

						case 'y-only':
							settings(settings().snapToDataX = false, true);
							settings(settings().snapToDataY = true, true);
							break;

						case 'both':
							settings(settings().snapToDataX = true, true);
							settings(settings().snapToDataY = true, true);
							break;
					}
				}
			}
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cls('grid grid-cols-[1fr_1fr_120px_120px] gap-2 mb-4 screenshot-hidden', $$props.class))
	]);

	$.append($$anchor, div);
	$.pop();
}