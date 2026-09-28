import * as $ from 'svelte/internal/server';
import ThresholdBase from './Threshold.base.svelte';
import Area from '../Area/Area.canvas.svelte';
import ClipPath from '../ClipPath/ClipPath.canvas.svelte';

export default function Threshold_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ThresholdBase($$renderer, $.spread_props([{ Area, ClipPath }, props]));
}