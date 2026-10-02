import * as $ from 'svelte/internal/server';
import ArcLabelBase from './ArcLabel.base.svelte';
import Path from '../Path/Path.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

export default function ArcLabel_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ArcLabelBase($$renderer, $.spread_props([{ Path, Text }, props]));
}