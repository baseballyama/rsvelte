import * as $ from 'svelte/internal/server';
import AnnotationLineBase from './AnnotationLine.base.svelte';
import Line from '../Line/Line.html.svelte';
import Text from '../Text/Text.html.svelte';

export default function AnnotationLine_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AnnotationLineBase($$renderer, $.spread_props([{ Line, Text }, props]));
}