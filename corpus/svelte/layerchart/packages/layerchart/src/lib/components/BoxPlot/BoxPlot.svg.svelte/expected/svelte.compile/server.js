import * as $ from 'svelte/internal/server';
import BoxPlotBase from './BoxPlot.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Line from '../Line/Line.svg.svelte';
import Circle from '../Circle/Circle.svg.svelte';

export default function BoxPlot_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BoxPlotBase($$renderer, $.spread_props([{ Group, Rect, Line, Circle }, props]));
}