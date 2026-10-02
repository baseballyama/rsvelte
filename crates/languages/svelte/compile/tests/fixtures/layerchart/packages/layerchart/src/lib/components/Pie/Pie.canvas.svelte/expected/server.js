import * as $ from 'svelte/internal/server';
import PieBase from './Pie.base.svelte';
import Arc from '../Arc/Arc.canvas.svelte';

export default function Pie_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	PieBase($$renderer, $.spread_props([{ Arc }, props]));
}