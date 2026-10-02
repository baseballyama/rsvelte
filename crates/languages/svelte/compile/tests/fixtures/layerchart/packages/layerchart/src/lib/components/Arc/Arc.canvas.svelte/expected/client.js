import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArcBase from './Arc.base.svelte';
import Path from '../Path/Path.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Arc_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	ArcBase($$anchor, $.spread_props(
		{
			get Path() {
				return Path;
			}
		},
		() => props
	));
}