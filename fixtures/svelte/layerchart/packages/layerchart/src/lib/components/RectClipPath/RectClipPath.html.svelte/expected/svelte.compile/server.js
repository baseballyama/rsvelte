import * as $ from 'svelte/internal/server';
import RectClipPathBase from './RectClipPath.base.svelte';
import ClipPath from '../ClipPath/ClipPath.html.svelte';

export default function RectClipPath_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	RectClipPathBase($$renderer, $.spread_props([{ ClipPath }, props]));
}