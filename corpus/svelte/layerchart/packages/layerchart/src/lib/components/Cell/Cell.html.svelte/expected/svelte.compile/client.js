import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CellBase from './Cell.base.svelte';
import Rect from '../Rect/Rect.html.svelte';
import Circle from '../Circle/Circle.html.svelte';
import Group from '../Group/Group.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Cell_html($$anchor, $$props) {
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