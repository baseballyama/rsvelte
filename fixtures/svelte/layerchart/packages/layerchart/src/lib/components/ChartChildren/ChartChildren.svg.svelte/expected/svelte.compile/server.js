import * as $ from 'svelte/internal/server';
import ChartChildrenBase from './ChartChildren.base.svelte';
import Layer from '../layers/Svg.svelte';
import Axis from '../Axis/Axis.svg.svelte';
import Grid from '../Grid/Grid.svg.svelte';
import Rule from '../Rule/Rule.svg.svelte';
import Highlight from '../Highlight/Highlight.svg.svelte';
import ChartClipPath from '../ChartClipPath/ChartClipPath.svg.svelte';

export default function ChartChildren_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ChartChildrenBase($$renderer, $.spread_props([{ Layer, Axis, Grid, Rule, Highlight, ChartClipPath }, props]));
}