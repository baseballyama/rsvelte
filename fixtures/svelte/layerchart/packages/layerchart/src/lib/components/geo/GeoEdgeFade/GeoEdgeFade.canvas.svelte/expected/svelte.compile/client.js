import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GeoEdgeFadeBase from './GeoEdgeFade.base.svelte';
import Group from '../../Group/Group.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function GeoEdgeFade_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	GeoEdgeFadeBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			}
		},
		() => props
	));
}