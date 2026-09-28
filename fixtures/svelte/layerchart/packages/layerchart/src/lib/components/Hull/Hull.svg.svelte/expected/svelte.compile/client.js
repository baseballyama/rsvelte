import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HullBase from './Hull.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Spline from '../Spline/Spline.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Hull_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	HullBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get Spline() {
				return Spline;
			}
		},
		() => props
	));
}