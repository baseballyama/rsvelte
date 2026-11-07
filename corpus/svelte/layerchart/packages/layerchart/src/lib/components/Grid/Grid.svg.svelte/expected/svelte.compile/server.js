import * as $ from 'svelte/internal/server';
import GridBase from './Grid.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Line from '../Line/Line.svg.svelte';
import Circle from '../Circle/Circle.svg.svelte';
import Rule from '../Rule/Rule.svg.svelte';

export default function Grid_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GridBase($$renderer, $.spread_props([{ Group, Line, Circle, Rule }, props]));
}