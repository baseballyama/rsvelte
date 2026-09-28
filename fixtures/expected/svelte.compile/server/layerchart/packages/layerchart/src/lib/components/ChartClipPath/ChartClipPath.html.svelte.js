import * as $ from 'svelte/internal/server';
import ChartClipPathBase from './ChartClipPath.base.svelte';
import RectClipPath from '../RectClipPath/RectClipPath.html.svelte';

export default function ChartClipPath_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ChartClipPathBase($$renderer, $.spread_props([{ RectClipPath }, props]));
}