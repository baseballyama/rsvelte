import * as $ from 'svelte/internal/server';
import VoronoiBase from './Voronoi.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Path from '../Path/Path.svg.svelte';
import CircleClipPath from '../CircleClipPath/CircleClipPath.svg.svelte';

export default function Voronoi_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	VoronoiBase($$renderer, $.spread_props([{ Group, Path, CircleClipPath }, props]));
}