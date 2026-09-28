import * as $ from 'svelte/internal/server';
import HullBase from './Hull.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Spline from '../Spline/Spline.canvas.svelte';

export default function Hull_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	HullBase($$renderer, $.spread_props([{ Group, Spline }, props]));
}