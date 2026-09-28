import * as $ from 'svelte/internal/server';
import PieBase from './Pie.base.svelte';
import Arc from '../Arc/Arc.svg.svelte';

export default function Pie_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	PieBase($$renderer, $.spread_props([{ Arc }, props]));
}