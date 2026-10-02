import * as $ from 'svelte/internal/server';
import AnnotationLineBase from './AnnotationLine.base.svelte';
import Line from '../Line/Line.svg.svelte';
import Text from '../Text/Text.svg.svelte';

export default function AnnotationLine_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AnnotationLineBase($$renderer, $.spread_props([{ Line, Text }, props]));
}