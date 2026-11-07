import * as $ from 'svelte/internal/server';
import GeoCircleBase from './GeoCircle.base.svelte';
import GeoPath from '../GeoPath/GeoPath.svg.svelte';

export default function GeoCircle_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoCircleBase($$renderer, $.spread_props([{ GeoPath }, props]));
}