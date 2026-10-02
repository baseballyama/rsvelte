import * as $ from 'svelte/internal/server';
import AnnotationRangeBase from './AnnotationRange.base.svelte';
import LinearGradient from '../LinearGradient/LinearGradient.canvas.svelte';
import Pattern from '../Pattern/Pattern.canvas.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

export default function AnnotationRange_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AnnotationRangeBase($$renderer, $.spread_props([{ LinearGradient, Pattern, Rect, Text }, props]));
}