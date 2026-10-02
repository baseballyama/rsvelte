import * as $ from 'svelte/internal/server';
import BarsBase from './Bars.base.svelte';
import Bar from '../Bar/Bar.canvas.svelte';
import Group from '../Group/Group.canvas.svelte';

export default function Bars_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BarsBase($$renderer, $.spread_props([{ Bar, Group }, props]));
}