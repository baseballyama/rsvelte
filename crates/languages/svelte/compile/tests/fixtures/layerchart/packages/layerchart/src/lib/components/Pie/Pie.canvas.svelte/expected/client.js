import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PieBase from './Pie.base.svelte';
import Arc from '../Arc/Arc.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Pie_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	PieBase($$anchor, $.spread_props(
		{
			get Arc() {
				return Arc;
			}
		},
		() => props
	));
}