import * as $ from 'svelte/internal/server';
import ThresholdBase from './Threshold.base.svelte';
import Area from '../Area/Area.svg.svelte';
import ClipPath from '../ClipPath/ClipPath.svg.svelte';

export default function Threshold_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ThresholdBase($$renderer, $.spread_props([{ Area, ClipPath }, props]));
}