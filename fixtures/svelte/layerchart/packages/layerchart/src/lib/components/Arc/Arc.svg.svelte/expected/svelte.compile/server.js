import * as $ from 'svelte/internal/server';
import ArcBase from './Arc.base.svelte';
import Path from '../Path/Path.svg.svelte';

export default function Arc_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ArcBase($$renderer, $.spread_props([{ Path }, props]));
}