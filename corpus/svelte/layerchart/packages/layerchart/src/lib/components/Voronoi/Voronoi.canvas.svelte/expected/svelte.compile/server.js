import * as $ from 'svelte/internal/server';
import VoronoiBase from './Voronoi.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Path from '../Path/Path.canvas.svelte';
import CircleClipPath from '../CircleClipPath/CircleClipPath.canvas.svelte';

export default function Voronoi_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	VoronoiBase($$renderer, $.spread_props([{ Group, Path, CircleClipPath }, props]));
}