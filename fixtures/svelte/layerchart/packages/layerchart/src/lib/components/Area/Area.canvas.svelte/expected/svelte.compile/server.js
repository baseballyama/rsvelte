import * as $ from 'svelte/internal/server';
import AreaBase from './Area.base.svelte';
import Path from '../Path/Path.canvas.svelte';
import Spline from '../Spline/Spline.canvas.svelte';

export default function Area_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AreaBase($$renderer, $.spread_props([{ Path, Spline }, props]));
}