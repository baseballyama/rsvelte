import * as $ from 'svelte/internal/server';
import MonthBase from './Month.base.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Group from '../Group/Group.svg.svelte';
import Text from '../Text/Text.svg.svelte';

export default function Month_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	MonthBase($$renderer, $.spread_props([{ Rect, Group, Text }, props]));
}