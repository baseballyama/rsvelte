import * as $ from 'svelte/internal/server';
import AnnotationLineBase from './AnnotationLine.base.svelte';
import Line from '../Line/Line.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

export default function AnnotationLine_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AnnotationLineBase($$renderer, $.spread_props([{ Line, Text }, props]));
}