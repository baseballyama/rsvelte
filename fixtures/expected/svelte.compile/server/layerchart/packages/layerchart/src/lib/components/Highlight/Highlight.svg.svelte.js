import * as $ from 'svelte/internal/server';
import HighlightBase from './Highlight.base.svelte';
import Circle from '../Circle/Circle.svg.svelte';
import Line from '../Line/Line.svg.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Arc from '../Arc/Arc.svg.svelte';

export default function Highlight_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	HighlightBase($$renderer, $.spread_props([{ Circle, Line, Rect, Arc }, props]));
}