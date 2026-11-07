import * as $ from 'svelte/internal/server';
import PointsBase from './Points.base.svelte';
import Circle from '../Circle/Circle.html.svelte';

export default function Points_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	PointsBase($$renderer, $.spread_props([{ Circle }, props]));
}