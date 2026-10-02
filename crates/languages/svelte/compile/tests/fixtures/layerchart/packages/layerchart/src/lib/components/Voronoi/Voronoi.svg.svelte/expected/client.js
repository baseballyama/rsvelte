import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VoronoiBase from './Voronoi.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Path from '../Path/Path.svg.svelte';
import CircleClipPath from '../CircleClipPath/CircleClipPath.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Voronoi_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	VoronoiBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get Path() {
				return Path;
			},

			get CircleClipPath() {
				return CircleClipPath;
			}
		},
		() => props
	));
}