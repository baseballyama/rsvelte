import * as $ from 'svelte/internal/server';
import ViolinBase from './Violin.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Path from '../Path/Path.canvas.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';

export default function Violin_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ViolinBase($$renderer, $.spread_props([{ Group, Path, Rect, Line }, props]));
}