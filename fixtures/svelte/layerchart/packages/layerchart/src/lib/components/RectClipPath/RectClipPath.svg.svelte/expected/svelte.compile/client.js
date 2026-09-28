import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RectClipPathBase from './RectClipPath.base.svelte';
import ClipPath from '../ClipPath/ClipPath.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function RectClipPath_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	RectClipPathBase($$anchor, $.spread_props(
		{
			get ClipPath() {
				return ClipPath;
			}
		},
		() => props
	));
}