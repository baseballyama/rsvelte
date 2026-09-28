import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleClipPathBase from './CircleClipPath.base.svelte';
import ClipPath from '../ClipPath/ClipPath.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function CircleClipPath_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	CircleClipPathBase($$anchor, $.spread_props(
		{
			get ClipPath() {
				return ClipPath;
			}
		},
		() => props
	));
}