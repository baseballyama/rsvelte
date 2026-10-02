import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContourBase from './Contour.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Path from '../Path/Path.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Contour_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	ContourBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get Path() {
				return Path;
			}
		},
		() => props
	));
}