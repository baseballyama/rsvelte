import * as $ from 'svelte/internal/server';
import ChartChildrenBase from './ChartChildren.base.svelte';
import Layer from '../layers/Canvas.svelte';
import Axis from '../Axis/Axis.canvas.svelte';
import Grid from '../Grid/Grid.canvas.svelte';
import Rule from '../Rule/Rule.canvas.svelte';
import Highlight from '../Highlight/Highlight.canvas.svelte';
import ChartClipPath from '../ChartClipPath/ChartClipPath.canvas.svelte';

export default function ChartChildren_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ChartChildrenBase($$renderer, $.spread_props([{ Layer, Axis, Grid, Rule, Highlight, ChartClipPath }, props]));
}