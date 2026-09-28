import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HighlightBase from './Highlight.base.svelte';
import Circle from '../Circle/Circle.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Arc from '../Arc/Arc.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Highlight_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	HighlightBase($$anchor, $.spread_props(
		{
			get Circle() {
				return Circle;
			},

			get Line() {
				return Line;
			},

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