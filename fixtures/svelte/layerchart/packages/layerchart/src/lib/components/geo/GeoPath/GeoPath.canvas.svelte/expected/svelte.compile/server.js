import * as $ from 'svelte/internal/server';
import GeoPathBase from './GeoPath.base.svelte';
import Path from '../../Path/Path.canvas.svelte';

export default function GeoPath_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoPathBase($$renderer, $.spread_props([{ Path }, props]));
}