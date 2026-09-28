import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AnnotationPointBase from './AnnotationPoint.base.svelte';
import Circle from '../Circle/Circle.canvas.svelte';
import Link from '../Link/Link.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function AnnotationPoint_canvas($$anchor, $$props) {
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