import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { interpolateRgb, interpolateLab, interpolateHclLong } from 'd3-interpolate';
import * as d3chromatic from 'd3-scale-chromatic';
import StepsControl from '$lib/components/controls/ColorRampControls.svelte';
import { ColorRamp } from 'layerchart';
import { entries } from '@layerstack/utils';

var root = $.from_html(`<div><div class="text-sm"> </div> <svg><!></svg></div>`);
var root_1 = $.from_html(`<!> <div class="grid gap-4 h-100 overflow-auto pr-2"></div>`, 1);

export default function Pixelated($$anchor, $$props) {
	$.push($$props, true);

	let width = '100%';
	let height = 20;
	let steps = $.state(5);
	const interpolators = entries(d3chromatic).filter(([key]) => key.startsWith('interpolate'));

	interpolators.push([
		`interpolateRgb('red', 'blue')`,
		interpolateRgb('red', 'blue')
	]);

	interpolators.push([
		`interpolateLab('red', 'blue')`,
		interpolateLab('red', 'blue')
	]);

	interpolators.push([
		`interpolateHclLong('red', 'blue')`,
		interpolateHclLong('red', 'blue')
	]);

	var fragment = root_1();
	var node = $.first_child(fragment);

	StepsControl(node, {
		get steps() {
			return $.get(steps);
		},

		set steps($$value) {
			$.set(steps, $$value, true);
		}
	});

	var div = $.sibling(node, 2);

	$.each(div, 21, () => interpolators, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let name = () => $.get($$array)[0];
		let interpolator = () => $.get($$array)[1];
		var div_1 = root();
		var div_2 = $.child(div_1);
		var text = $.only_child(div_2, true);
		var svg = $.sibling(div_2, 2);

		$.set_attribute(svg, 'width', width);
		$.set_attribute(svg, 'height', height);

		var node_1 = $.child(svg);

		ColorRamp(node_1, {
			get interpolator() {
				return interpolator();
			},
			width,
			height,
			get steps() {
				return $.get(steps);
			},
			class: '[image-rendering:pixelated]'
		});

		$.reset(svg);
		$.reset(div_1);
		$.template_effect(() => $.set_text(text, name()));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}