import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HighlightBase from './Highlight.base.svelte';
import Circle from '../Circle/Circle.html.svelte';
import Line from '../Line/Line.html.svelte';
import Rect from '../Rect/Rect.html.svelte';
import Arc from '../Arc/Arc.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Highlight_html($$anchor, $$props) {
	// Arc has no html variant — radial highlight area uses SVG path. Highlight.html
	// never enters the radial branch (no html chart context is radial), but we
	// import Arc.svg here so the per-layer wrapper avoids the agnostic dispatcher.
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