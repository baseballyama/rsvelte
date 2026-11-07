import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ViolinBase from './Violin.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Path from '../Path/Path.canvas.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Violin_canvas($$anchor, $$props) {
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