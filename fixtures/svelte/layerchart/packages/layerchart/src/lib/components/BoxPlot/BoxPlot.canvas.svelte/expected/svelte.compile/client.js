import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BoxPlotBase from './BoxPlot.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';
import Circle from '../Circle/Circle.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function BoxPlot_canvas($$anchor, $$props) {
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