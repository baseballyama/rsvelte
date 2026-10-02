import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GraticuleBase from './Graticule.base.svelte';
import Group from '../../Group/Group.svg.svelte';
import GeoPath from '../GeoPath/GeoPath.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Graticule_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	GraticuleBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get GeoPath() {
				return GeoPath;
			}
		},
		() => props
	));
}