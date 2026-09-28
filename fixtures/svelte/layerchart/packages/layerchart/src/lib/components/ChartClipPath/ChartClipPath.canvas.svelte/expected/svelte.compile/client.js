import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartClipPathBase from './ChartClipPath.base.svelte';
import RectClipPath from '../RectClipPath/RectClipPath.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function ChartClipPath_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	ChartClipPathBase($$anchor, $.spread_props(
		{
			get RectClipPath() {
				return RectClipPath;
			}
		},
		() => props
	));
}