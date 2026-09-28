import * as $ from 'svelte/internal/server';
import RuleBase from './Rule.base.svelte';
import Group from '../Group/Group.html.svelte';
import Line from '../Line/Line.html.svelte';
import Circle from '../Circle/Circle.html.svelte';

export default function Rule_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	RuleBase($$renderer, $.spread_props([{ Group, Line, Circle }, props]));
}