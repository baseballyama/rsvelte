import * as $ from 'svelte/internal/server';
import BarsBase from './Bars.base.svelte';
import Bar from '../Bar/Bar.svg.svelte';
import Group from '../Group/Group.svg.svelte';

export default function Bars_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BarsBase($$renderer, $.spread_props([{ Bar, Group }, props]));
}