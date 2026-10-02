import * as $ from 'svelte/internal/server';
import ChartChildrenBase from './ChartChildren.base.svelte';
import Layer from '../layers/Layer.svelte';
import Axis from '../Axis/Axis.svelte';
import Grid from '../Grid/Grid.svelte';
import Rule from '../Rule/Rule.svelte';
import Highlight from '../Highlight/Highlight.svelte';
import ChartClipPath from '../ChartClipPath/ChartClipPath.svelte';

export default function ChartChildren($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ChartChildrenBase($$renderer, $.spread_props([{ Layer, Axis, Grid, Rule, Highlight, ChartClipPath }, props]));
}