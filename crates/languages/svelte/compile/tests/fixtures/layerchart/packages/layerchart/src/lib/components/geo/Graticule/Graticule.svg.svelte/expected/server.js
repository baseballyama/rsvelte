import * as $ from 'svelte/internal/server';
import GraticuleBase from './Graticule.base.svelte';
import Group from '../../Group/Group.svg.svelte';
import GeoPath from '../GeoPath/GeoPath.svg.svelte';

export default function Graticule_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GraticuleBase($$renderer, $.spread_props([{ Group, GeoPath }, props]));
}