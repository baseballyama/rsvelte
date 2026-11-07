import * as $ from 'svelte/internal/server';
import LinkBase from './Link.base.svelte';
import Path from '../Path/Path.canvas.svelte';

export default function Link_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	LinkBase($$renderer, $.spread_props([{ Path }, props]));
}