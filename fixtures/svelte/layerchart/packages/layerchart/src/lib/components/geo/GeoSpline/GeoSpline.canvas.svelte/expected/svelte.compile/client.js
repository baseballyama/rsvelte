import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GeoSplineBase from './GeoSpline.base.svelte';
import Path from '../../Path/Path.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function GeoSpline_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	GeoSplineBase($$anchor, $.spread_props(
		{
			get Path() {
				return Path;
			}
		},
		() => props
	));
}