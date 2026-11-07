import * as $ from 'svelte/internal/server';
import AnnotationRangeBase from './AnnotationRange.base.svelte';
import LinearGradient from '../LinearGradient/LinearGradient.html.svelte';
import Pattern from '../Pattern/Pattern.html.svelte';
import Rect from '../Rect/Rect.html.svelte';
import Text from '../Text/Text.html.svelte';

export default function AnnotationRange_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AnnotationRangeBase($$renderer, $.spread_props([{ LinearGradient, Pattern, Rect, Text }, props]));
}