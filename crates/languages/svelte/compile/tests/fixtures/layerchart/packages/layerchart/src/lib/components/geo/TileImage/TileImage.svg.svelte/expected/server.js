import * as $ from 'svelte/internal/server';
import TileImageBase from './TileImage.base.svelte';
import Text from '../../Text/Text.svg.svelte';

export default function TileImage_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	TileImageBase($$renderer, $.spread_props([{ Text }, props]));
}