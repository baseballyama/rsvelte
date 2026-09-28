import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AreaBase from './Area.base.svelte';
import Path from '../Path/Path.svg.svelte';
import Spline from '../Spline/Spline.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Area_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	AreaBase($$anchor, $.spread_props(
		{
			get Path() {
				return Path;
			},

			get Spline() {
				return Spline;
			}
		},
		() => props
	));
}