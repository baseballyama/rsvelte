import * as $ from 'svelte/internal/server';
import PointsBase from './Points.base.svelte';
import Circle from '../Circle/Circle.svg.svelte';

export default function Points_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	PointsBase($$renderer, $.spread_props([{ Circle }, props]));
}