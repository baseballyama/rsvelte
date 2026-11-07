import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GeoPointBase from './GeoPoint.base.svelte';
import Circle from '../../Circle/Circle.svg.svelte';
import Group from '../../Group/Group.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function GeoPoint_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	GeoPointBase($$anchor, $.spread_props(
		{
			get Circle() {
				return Circle;
			},

			get Group() {
				return Group;
			}
		},
		() => props
	));
}