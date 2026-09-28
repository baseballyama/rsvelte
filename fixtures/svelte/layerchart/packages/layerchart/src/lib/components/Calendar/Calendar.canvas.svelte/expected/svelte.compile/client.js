import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarBase from './Calendar.base.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Calendar_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	CalendarBase($$anchor, $.spread_props(
		{
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