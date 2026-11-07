import * as $ from 'svelte/internal/server';
import ChartClipPathBase from './ChartClipPath.base.svelte';
import RectClipPath from '../RectClipPath/RectClipPath.svg.svelte';

export default function ChartClipPath_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ChartClipPathBase($$renderer, $.spread_props([{ RectClipPath }, props]));
}