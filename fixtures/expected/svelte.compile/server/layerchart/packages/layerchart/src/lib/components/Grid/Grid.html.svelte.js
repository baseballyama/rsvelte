import * as $ from 'svelte/internal/server';
import GridBase from './Grid.base.svelte';
import Group from '../Group/Group.html.svelte';
import Line from '../Line/Line.html.svelte';
import Circle from '../Circle/Circle.html.svelte';
import Rule from '../Rule/Rule.html.svelte';

export default function Grid_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GridBase($$renderer, $.spread_props([{ Group, Line, Circle, Rule }, props]));
}