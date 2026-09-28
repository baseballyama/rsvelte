import * as $ from 'svelte/internal/server';
import HighlightBase from './Highlight.base.svelte';
import Circle from '../Circle/Circle.html.svelte';
import Line from '../Line/Line.html.svelte';
import Rect from '../Rect/Rect.html.svelte';
import Arc from '../Arc/Arc.svg.svelte';

export default function Highlight_html($$renderer, $$props) {
	// Arc has no html variant — radial highlight area uses SVG path. Highlight.html
	// never enters the radial branch (no html chart context is radial), but we
	// import Arc.svg here so the per-layer wrapper avoids the agnostic dispatcher.
	let { $$slots, $$events, ...props } = $$props;

	HighlightBase($$renderer, $.spread_props([{ Circle, Line, Rect, Arc }, props]));
}