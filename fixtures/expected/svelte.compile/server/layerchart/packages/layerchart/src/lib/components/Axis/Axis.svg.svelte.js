import * as $ from 'svelte/internal/server';
import AxisBase from './Axis.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Line from '../Line/Line.svg.svelte';
import Text from '../Text/Text.svg.svelte';
import Rule from '../Rule/Rule.svg.svelte';

export default function Axis_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AxisBase($$renderer, $.spread_props([{ Group, Line, Text, Rule }, props]));
}