import * as $ from 'svelte/internal/server';
import DensityBase from './Density.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Path from '../Path/Path.canvas.svelte';

export default function Density_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	DensityBase($$renderer, $.spread_props([{ Group, Path }, props]));
}