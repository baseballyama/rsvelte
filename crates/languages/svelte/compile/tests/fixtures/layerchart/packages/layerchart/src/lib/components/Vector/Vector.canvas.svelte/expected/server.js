import * as $ from 'svelte/internal/server';
import VectorBase from './Vector.base.svelte';
import Path from '../Path/Path.canvas.svelte';

export default function Vector_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	VectorBase($$renderer, $.spread_props([{ Path }, props]));
}