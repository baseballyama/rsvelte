import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FrameBase from './Frame.base.svelte';
import Rect from '../Rect/Rect.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Frame_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	FrameBase($$anchor, $.spread_props(
		{
			get Rect() {
				return Rect;
			}
		},
		() => props
	));
}