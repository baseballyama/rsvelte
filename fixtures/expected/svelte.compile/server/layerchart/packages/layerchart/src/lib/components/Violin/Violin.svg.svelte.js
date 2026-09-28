import * as $ from 'svelte/internal/server';
import ViolinBase from './Violin.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Path from '../Path/Path.svg.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Line from '../Line/Line.svg.svelte';

export default function Violin_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ViolinBase($$renderer, $.spread_props([{ Group, Path, Rect, Line }, props]));
}