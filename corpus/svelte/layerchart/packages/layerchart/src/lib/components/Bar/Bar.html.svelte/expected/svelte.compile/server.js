import * as $ from 'svelte/internal/server';
import BarBase from './Bar.base.svelte';
import Rect from '../Rect/Rect.html.svelte';

export default function Bar_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BarBase($$renderer, $.spread_props([{ Rect }, props]));
}