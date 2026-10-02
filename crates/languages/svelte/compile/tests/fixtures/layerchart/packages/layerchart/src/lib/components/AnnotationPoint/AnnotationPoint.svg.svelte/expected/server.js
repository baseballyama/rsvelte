import * as $ from 'svelte/internal/server';
import AnnotationPointBase from './AnnotationPoint.base.svelte';
import Circle from '../Circle/Circle.svg.svelte';
import Link from '../Link/Link.svg.svelte';
import Text from '../Text/Text.svg.svelte';

export default function AnnotationPoint_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	AnnotationPointBase($$renderer, $.spread_props([{ Circle, Link, Text }, props]));
}