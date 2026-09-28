import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ViolinBase from './Violin.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Path from '../Path/Path.svg.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Line from '../Line/Line.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Violin_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	ViolinBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get Path() {
				return Path;
			},

			get Rect() {
				return Rect;
			},

			get Line() {
				return Line;
			}
		},
		() => props
	));
}