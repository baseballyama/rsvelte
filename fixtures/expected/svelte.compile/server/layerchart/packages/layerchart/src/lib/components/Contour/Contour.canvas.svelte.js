import * as $ from 'svelte/internal/server';
import ContourBase from './Contour.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Path from '../Path/Path.canvas.svelte';

export default function Contour_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ContourBase($$renderer, $.spread_props([{ Group, Path }, props]));
}