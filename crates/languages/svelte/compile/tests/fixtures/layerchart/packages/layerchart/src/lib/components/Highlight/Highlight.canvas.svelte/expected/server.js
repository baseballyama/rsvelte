import * as $ from 'svelte/internal/server';
import HighlightBase from './Highlight.base.svelte';
import Circle from '../Circle/Circle.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Arc from '../Arc/Arc.canvas.svelte';

export default function Highlight_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	HighlightBase($$renderer, $.spread_props([{ Circle, Line, Rect, Arc }, props]));
}