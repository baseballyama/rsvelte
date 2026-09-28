import * as $ from 'svelte/internal/server';
import AxisBase from './Axis.base.svelte';
import Group from '../Group/Group.html.svelte';
import Line from '../Line/Line.html.svelte';
import Text from '../Text/Text.html.svelte';
import Rule from '../Rule/Rule.html.svelte';

export default function Axis_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AxisBase($$renderer, $.spread_props([{ Group, Line, Text, Rule }, props]));
}