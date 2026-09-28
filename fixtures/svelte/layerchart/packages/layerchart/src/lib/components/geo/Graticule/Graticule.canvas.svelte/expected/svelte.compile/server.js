import * as $ from 'svelte/internal/server';
import GraticuleBase from './Graticule.base.svelte';
import Group from '../../Group/Group.canvas.svelte';
import GeoPath from '../GeoPath/GeoPath.canvas.svelte';

export default function Graticule_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GraticuleBase($$renderer, $.spread_props([{ Group, GeoPath }, props]));
}