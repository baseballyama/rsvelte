import * as $ from 'svelte/internal/server';
import HullBase from './Hull.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Spline from '../Spline/Spline.svg.svelte';

export default function Hull_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	HullBase($$renderer, $.spread_props([{ Group, Spline }, props]));
}