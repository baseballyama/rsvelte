import * as $ from 'svelte/internal/server';
import GridBase from './Grid.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';
import Circle from '../Circle/Circle.canvas.svelte';
import Rule from '../Rule/Rule.canvas.svelte';

export default function Grid_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GridBase($$renderer, $.spread_props([{ Group, Line, Circle, Rule }, props]));
}