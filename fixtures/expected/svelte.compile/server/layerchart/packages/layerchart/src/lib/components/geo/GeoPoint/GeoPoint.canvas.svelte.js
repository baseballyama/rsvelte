import * as $ from 'svelte/internal/server';
import GeoPointBase from './GeoPoint.base.svelte';
import Circle from '../../Circle/Circle.canvas.svelte';
import Group from '../../Group/Group.canvas.svelte';

export default function GeoPoint_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoPointBase($$renderer, $.spread_props([{ Circle, Group }, props]));
}