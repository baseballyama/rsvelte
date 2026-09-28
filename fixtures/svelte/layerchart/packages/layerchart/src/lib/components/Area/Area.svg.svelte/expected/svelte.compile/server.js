import * as $ from 'svelte/internal/server';
import AreaBase from './Area.base.svelte';
import Path from '../Path/Path.svg.svelte';
import Spline from '../Spline/Spline.svg.svelte';

export default function Area_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AreaBase($$renderer, $.spread_props([{ Path, Spline }, props]));
}