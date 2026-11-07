import * as $ from 'svelte/internal/server';
import CalendarBase from './Calendar.base.svelte';
import Rect from '../Rect/Rect.html.svelte';
import Text from '../Text/Text.html.svelte';

export default function Calendar_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	CalendarBase($$renderer, $.spread_props([{ Rect, Text }, props]));
}