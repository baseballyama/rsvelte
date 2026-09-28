import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PointsBase from './Points.base.svelte';
import Circle from '../Circle/Circle.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Points_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	PointsBase($$anchor, $.spread_props(
		{
			get Circle() {
				return Circle;
			}
		},
		() => props
	));
}