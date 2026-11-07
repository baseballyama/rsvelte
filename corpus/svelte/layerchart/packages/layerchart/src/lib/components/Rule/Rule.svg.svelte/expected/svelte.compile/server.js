import * as $ from 'svelte/internal/server';
import RuleBase from './Rule.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Line from '../Line/Line.svg.svelte';
import Circle from '../Circle/Circle.svg.svelte';

export default function Rule_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	RuleBase($$renderer, $.spread_props([{ Group, Line, Circle }, props]));
}