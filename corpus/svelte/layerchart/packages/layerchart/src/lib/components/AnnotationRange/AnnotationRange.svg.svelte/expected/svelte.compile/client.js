import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AnnotationRangeBase from './AnnotationRange.base.svelte';
import LinearGradient from '../LinearGradient/LinearGradient.svg.svelte';
import Pattern from '../Pattern/Pattern.svg.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Text from '../Text/Text.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function AnnotationRange_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	AnnotationRangeBase($$anchor, $.spread_props(
		{
			get LinearGradient() {
				return LinearGradient;
			},

			get Pattern() {
				return Pattern;
			},

			get Rect() {
				return Rect;
			},

			get Text() {
				return Text;
			}
		},
		() => props
	));
}