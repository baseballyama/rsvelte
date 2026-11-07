import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import VoronoiBase from './Voronoi.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Path from '../Path/Path.canvas.svelte';
import CircleClipPath from '../CircleClipPath/CircleClipPath.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Voronoi_canvas($$anchor, $$props) {
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