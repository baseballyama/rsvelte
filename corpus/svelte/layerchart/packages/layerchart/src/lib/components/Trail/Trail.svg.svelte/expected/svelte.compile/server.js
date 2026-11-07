import * as $ from 'svelte/internal/server';
import TrailBase from './Trail.base.svelte';
import Path from '../Path/Path.svg.svelte';

export default function Trail_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	TrailBase($$renderer, $.spread_props([{ Path }, props]));
}