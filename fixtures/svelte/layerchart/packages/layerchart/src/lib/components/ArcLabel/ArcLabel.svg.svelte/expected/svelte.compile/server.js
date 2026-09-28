import * as $ from 'svelte/internal/server';
import ArcLabelBase from './ArcLabel.base.svelte';
import Path from '../Path/Path.svg.svelte';
import Text from '../Text/Text.svg.svelte';

export default function ArcLabel_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	ArcLabelBase($$renderer, $.spread_props([{ Path, Text }, props]));
}