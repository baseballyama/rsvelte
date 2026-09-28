import * as $ from 'svelte/internal/server';
import CircleClipPathBase from './CircleClipPath.base.svelte';
import ClipPath from '../ClipPath/ClipPath.html.svelte';

export default function CircleClipPath_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	CircleClipPathBase($$renderer, $.spread_props([{ ClipPath }, props]));
}