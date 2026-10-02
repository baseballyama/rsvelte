import * as $ from 'svelte/internal/server';
import SplineBase from './Spline.base.svelte';
import Path from '../Path/Path.svg.svelte';

export default function Spline_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	SplineBase($$renderer, $.spread_props([{ Path }, props]));
}