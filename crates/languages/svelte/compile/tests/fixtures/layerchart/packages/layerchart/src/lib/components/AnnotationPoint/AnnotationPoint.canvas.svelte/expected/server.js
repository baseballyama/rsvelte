import * as $ from 'svelte/internal/server';
import AnnotationPointBase from './AnnotationPoint.base.svelte';
import Circle from '../Circle/Circle.canvas.svelte';
import Link from '../Link/Link.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

export default function AnnotationPoint_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AnnotationPointBase($$renderer, $.spread_props([{ Circle, Link, Text }, props]));
}