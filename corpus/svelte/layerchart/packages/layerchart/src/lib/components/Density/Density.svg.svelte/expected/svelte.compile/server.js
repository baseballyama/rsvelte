import * as $ from 'svelte/internal/server';
import DensityBase from './Density.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Path from '../Path/Path.svg.svelte';

export default function Density_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	DensityBase($$renderer, $.spread_props([{ Group, Path }, props]));
}