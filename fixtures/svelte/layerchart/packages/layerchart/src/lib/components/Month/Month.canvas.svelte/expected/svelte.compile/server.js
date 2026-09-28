import * as $ from 'svelte/internal/server';
import MonthBase from './Month.base.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Group from '../Group/Group.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

export default function Month_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	MonthBase($$renderer, $.spread_props([{ Rect, Group, Text }, props]));
}