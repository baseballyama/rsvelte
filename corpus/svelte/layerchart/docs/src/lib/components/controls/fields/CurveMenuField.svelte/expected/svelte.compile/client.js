import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as d3shapes from 'd3-shape';
import { MenuField } from 'svelte-ux';
import { entries } from '@layerstack/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'showOpenClosed']);
var root = $.from_html(`<div class="screenshot-hidden"><!></div>`);

export default function CurveMenuField($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		showOpenClosed = $.prop($$props, 'showOpenClosed', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	if (value() === undefined) {
		value(d3shapes['curveLinear']);
	}

	const options = entries(d3shapes).filter(([key]) => {
		return key.startsWith('curve') && (showOpenClosed()
			? true
			: !key.endsWith('Open') && !key.endsWith('Closed')) && !key.includes('Bundle');
		// Not compatibile with area
	}).map(([key, value]) => {
		return { label: key.replace('curve', ''), value };
	});

	var div = root();
	var node = $.child(div);

	MenuField(node, $.spread_props(
		{
			label: 'Curve',
			get options() {
				return options;
			},
			stepper: true,
			classes: { menuIcon: 'hidden' }
		},
		() => restProps,
		{
			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			}
		}
	));

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}