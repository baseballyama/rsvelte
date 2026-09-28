import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrailBase from './Trail.base.svelte';
import Path from '../Path/Path.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Trail_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	TrailBase($$anchor, $.spread_props(
		{
			get Path() {
				return Path;
			}
		},
		() => props
	));
}