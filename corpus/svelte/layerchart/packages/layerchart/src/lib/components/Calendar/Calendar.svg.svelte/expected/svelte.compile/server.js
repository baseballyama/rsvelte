import * as $ from 'svelte/internal/server';
import CalendarBase from './Calendar.base.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Text from '../Text/Text.svg.svelte';

export default function Calendar_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	CalendarBase($$renderer, $.spread_props([{ Rect, Text }, props]));
}