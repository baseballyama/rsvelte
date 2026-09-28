import * as $ from 'svelte/internal/server';
import BoxPlotBase from './BoxPlot.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';
import Circle from '../Circle/Circle.canvas.svelte';

export default function BoxPlot_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	BoxPlotBase($$renderer, $.spread_props([{ Group, Rect, Line, Circle }, props]));
}