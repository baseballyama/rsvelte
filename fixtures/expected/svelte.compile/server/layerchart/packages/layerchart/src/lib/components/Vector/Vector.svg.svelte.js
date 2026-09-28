import * as $ from 'svelte/internal/server';
import VectorBase from './Vector.base.svelte';
import Path from '../Path/Path.svg.svelte';

export default function Vector_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	VectorBase($$renderer, $.spread_props([{ Path }, props]));
}