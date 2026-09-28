import * as $ from 'svelte/internal/server';
import AxisBase from './Axis.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';
import Rule from '../Rule/Rule.canvas.svelte';

export default function Axis_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AxisBase($$renderer, $.spread_props([{ Group, Line, Text, Rule }, props]));
}