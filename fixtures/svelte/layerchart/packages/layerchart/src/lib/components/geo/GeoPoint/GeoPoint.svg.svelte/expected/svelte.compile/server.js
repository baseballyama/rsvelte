import * as $ from 'svelte/internal/server';
import GeoPointBase from './GeoPoint.base.svelte';
import Circle from '../../Circle/Circle.svg.svelte';
import Group from '../../Group/Group.svg.svelte';

export default function GeoPoint_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoPointBase($$renderer, $.spread_props([{ Circle, Group }, props]));
}