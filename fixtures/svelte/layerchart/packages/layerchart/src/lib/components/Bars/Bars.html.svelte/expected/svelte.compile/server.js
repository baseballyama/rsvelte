import * as $ from 'svelte/internal/server';
import BarsBase from './Bars.base.svelte';
import Bar from '../Bar/Bar.html.svelte';
import Group from '../Group/Group.html.svelte';

export default function Bars_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BarsBase($$renderer, $.spread_props([{ Bar, Group }, props]));
}