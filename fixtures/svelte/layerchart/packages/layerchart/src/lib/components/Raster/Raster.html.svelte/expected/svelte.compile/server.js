import * as $ from 'svelte/internal/server';
import RasterBase from './Raster.base.svelte';
import Image from '../Image/Image.html.svelte';

export default function Raster_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	RasterBase($$renderer, $.spread_props([{ Image }, props]));
}