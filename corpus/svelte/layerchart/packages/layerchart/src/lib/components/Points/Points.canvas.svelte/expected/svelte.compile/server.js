import * as $ from 'svelte/internal/server';
import PointsBase from './Points.base.svelte';
import Circle from '../Circle/Circle.canvas.svelte';

export default function Points_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	PointsBase($$renderer, $.spread_props([{ Circle }, props]));
}