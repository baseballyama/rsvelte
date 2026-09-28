import * as $ from 'svelte/internal/server';
import RuleBase from './Rule.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';
import Circle from '../Circle/Circle.canvas.svelte';

export default function Rule_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	RuleBase($$renderer, $.spread_props([{ Group, Line, Circle }, props]));
}