import * as $ from 'svelte/internal/server';
import CalendarBase from './Calendar.base.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

export default function Calendar_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	CalendarBase($$renderer, $.spread_props([{ Rect, Text }, props]));
}