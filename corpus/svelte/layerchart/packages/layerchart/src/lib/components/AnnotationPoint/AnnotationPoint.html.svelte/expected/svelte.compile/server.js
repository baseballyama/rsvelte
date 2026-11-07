import * as $ from 'svelte/internal/server';
import AnnotationPointBase from './AnnotationPoint.base.svelte';
import Circle from '../Circle/Circle.html.svelte';
import Text from '../Text/Text.html.svelte';

export default function AnnotationPoint_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AnnotationPointBase($$renderer, $.spread_props([{ Circle, Text }, props]));
}