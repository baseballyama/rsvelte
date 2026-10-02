import * as $ from 'svelte/internal/server';
import MonthBase from './Month.base.svelte';
import Rect from '../Rect/Rect.html.svelte';
import Group from '../Group/Group.html.svelte';
import Text from '../Text/Text.html.svelte';

export default function Month_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	MonthBase($$renderer, $.spread_props([{ Rect, Group, Text }, props]));
}