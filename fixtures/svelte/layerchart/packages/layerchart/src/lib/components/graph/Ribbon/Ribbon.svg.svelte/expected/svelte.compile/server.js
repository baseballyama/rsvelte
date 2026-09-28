import * as $ from 'svelte/internal/server';
import RibbonBase from './Ribbon.base.svelte';
import Path from '../../Path/Path.svg.svelte';

export default function Ribbon_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	RibbonBase($$renderer, $.spread_props([{ Path }, props]));
}