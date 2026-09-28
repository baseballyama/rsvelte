import * as $ from 'svelte/internal/server';
import FrameBase from './Frame.base.svelte';
import Rect from '../Rect/Rect.html.svelte';

export default function Frame_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	FrameBase($$renderer, $.spread_props([{ Rect }, props]));
}