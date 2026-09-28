import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AnnotationPointBase from './AnnotationPoint.base.svelte';
import Circle from '../Circle/Circle.svg.svelte';
import Link from '../Link/Link.svg.svelte';
import Text from '../Text/Text.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function AnnotationPoint_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	AnnotationPointBase($$anchor, $.spread_props(
		{
			get Circle() {
				return Circle;
			},

			get Link() {
				return Link;
			},

			get Text() {
				return Text;
			}
		},
		() => props
	));
}