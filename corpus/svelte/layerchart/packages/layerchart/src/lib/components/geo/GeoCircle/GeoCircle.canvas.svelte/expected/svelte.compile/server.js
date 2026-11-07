import * as $ from 'svelte/internal/server';
import GeoCircleBase from './GeoCircle.base.svelte';
import GeoPath from '../GeoPath/GeoPath.canvas.svelte';

export default function GeoCircle_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoCircleBase($$renderer, $.spread_props([{ GeoPath }, props]));
}