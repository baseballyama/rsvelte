import * as $ from 'svelte/internal/server';
import BarBase from './Bar.base.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Arc from '../Arc/Arc.canvas.svelte';

export default function Bar_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BarBase($$renderer, $.spread_props([{ Rect, Arc }, props]));
}