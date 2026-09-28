import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AnnotationRangeBase from './AnnotationRange.base.svelte';
import LinearGradient from '../LinearGradient/LinearGradient.canvas.svelte';
import Pattern from '../Pattern/Pattern.canvas.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function AnnotationRange_canvas($$anchor, $$props) {
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