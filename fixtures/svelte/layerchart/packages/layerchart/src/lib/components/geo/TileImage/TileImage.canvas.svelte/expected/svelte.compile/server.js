import * as $ from 'svelte/internal/server';
import TileImageBase from './TileImage.base.svelte';
import Text from '../../Text/Text.canvas.svelte';

export default function TileImage_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	TileImageBase($$renderer, $.spread_props([{ Text }, props]));
}