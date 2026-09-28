import * as $ from 'svelte/internal/server';
import AnnotationRangeBase from './AnnotationRange.base.svelte';
import LinearGradient from '../LinearGradient/LinearGradient.svg.svelte';
import Pattern from '../Pattern/Pattern.svg.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Text from '../Text/Text.svg.svelte';

export default function AnnotationRange_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AnnotationRangeBase($$renderer, $.spread_props([{ LinearGradient, Pattern, Rect, Text }, props]));
}