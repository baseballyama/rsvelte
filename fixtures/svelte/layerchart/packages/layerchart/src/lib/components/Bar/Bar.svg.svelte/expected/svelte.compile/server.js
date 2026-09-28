import * as $ from 'svelte/internal/server';
import BarBase from './Bar.base.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Arc from '../Arc/Arc.svg.svelte';

export default function Bar_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BarBase($$renderer, $.spread_props([{ Rect, Arc }, props]));
}