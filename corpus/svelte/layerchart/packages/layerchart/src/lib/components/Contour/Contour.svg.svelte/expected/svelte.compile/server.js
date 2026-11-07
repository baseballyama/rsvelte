import * as $ from 'svelte/internal/server';
import ContourBase from './Contour.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Path from '../Path/Path.svg.svelte';

export default function Contour_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ContourBase($$renderer, $.spread_props([{ Group, Path }, props]));
}