import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CellBase from './Cell.base.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Circle from '../Circle/Circle.canvas.svelte';
import Group from '../Group/Group.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Cell_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	CellBase($$anchor, $.spread_props(
		{
			get Rect() {
				return Rect;
			},

			get Circle() {
				return Circle;
			},

			get Group() {
				return Group;
			}
		},
		() => props
	));
}