import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BarBase from './Bar.base.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Arc from '../Arc/Arc.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Bar_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	BarBase($$anchor, $.spread_props(
		{
			get Rect() {
				return Rect;
			},

			get Arc() {
				return Arc;
			}
		},
		() => props
	));
}