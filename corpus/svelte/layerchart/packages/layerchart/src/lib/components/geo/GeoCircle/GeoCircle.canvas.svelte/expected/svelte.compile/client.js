import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GeoCircleBase from './GeoCircle.base.svelte';
import GeoPath from '../GeoPath/GeoPath.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function GeoCircle_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	GeoCircleBase($$anchor, $.spread_props(
		{
			get GeoPath() {
				return GeoPath;
			}
		},
		() => props
	));
}