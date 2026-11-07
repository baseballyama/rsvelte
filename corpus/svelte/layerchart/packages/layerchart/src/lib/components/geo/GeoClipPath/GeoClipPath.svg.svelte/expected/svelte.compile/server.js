import * as $ from 'svelte/internal/server';
import GeoClipPathBase from './GeoClipPath.base.svelte';
import ClipPath from '../../ClipPath/ClipPath.svg.svelte';

export default function GeoClipPath_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoClipPathBase($$renderer, $.spread_props([{ ClipPath }, props]));
}