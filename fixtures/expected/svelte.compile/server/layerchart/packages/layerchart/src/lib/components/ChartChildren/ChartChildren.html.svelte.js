import * as $ from 'svelte/internal/server';
import ChartChildrenBase from './ChartChildren.base.svelte';
import Layer from '../layers/Html.svelte';
import Axis from '../Axis/Axis.html.svelte';
import Grid from '../Grid/Grid.html.svelte';
import Rule from '../Rule/Rule.html.svelte';
import Highlight from '../Highlight/Highlight.html.svelte';
import ChartClipPath from '../ChartClipPath/ChartClipPath.html.svelte';

export default function ChartChildren_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ChartChildrenBase($$renderer, $.spread_props([{ Layer, Axis, Grid, Rule, Highlight, ChartClipPath }, props]));
}