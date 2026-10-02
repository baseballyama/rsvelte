import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BoxPlotBase from './BoxPlot.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Line from '../Line/Line.svg.svelte';
import Circle from '../Circle/Circle.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function BoxPlot_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	BoxPlotBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get Rect() {
				return Rect;
			},

			get Line() {
				return Line;
			},

			get Circle() {
				return Circle;
			}
		},
		() => props
	));
}