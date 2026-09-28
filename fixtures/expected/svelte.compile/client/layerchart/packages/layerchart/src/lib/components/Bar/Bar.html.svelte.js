import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BarBase from './Bar.base.svelte';
import Rect from '../Rect/Rect.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Bar_html($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	BarBase($$anchor, $.spread_props(
		{
			get Rect() {
				return Rect;
			}
		},
		() => props
	));
}