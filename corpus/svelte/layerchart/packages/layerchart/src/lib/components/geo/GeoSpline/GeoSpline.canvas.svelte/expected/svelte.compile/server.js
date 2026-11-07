import * as $ from 'svelte/internal/server';
import GeoSplineBase from './GeoSpline.base.svelte';
import Path from '../../Path/Path.canvas.svelte';

export default function GeoSpline_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoSplineBase($$renderer, $.spread_props([{ Path }, props]));
}