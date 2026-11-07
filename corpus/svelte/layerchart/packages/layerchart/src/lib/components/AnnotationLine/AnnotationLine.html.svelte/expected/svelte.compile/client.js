import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AnnotationLineBase from './AnnotationLine.base.svelte';
import Line from '../Line/Line.html.svelte';
import Text from '../Text/Text.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function AnnotationLine_html($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	AnnotationLineBase($$anchor, $.spread_props(
		{
			get Line() {
				return Line;
			},

			get Text() {
				return Text;
			}
		},
		() => props
	));
}