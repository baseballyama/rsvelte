import * as $ from 'svelte/internal/server';
import GeoEdgeFadeBase from './GeoEdgeFade.base.svelte';
import Group from '../../Group/Group.canvas.svelte';

export default function GeoEdgeFade_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoEdgeFadeBase($$renderer, $.spread_props([{ Group }, props]));
}