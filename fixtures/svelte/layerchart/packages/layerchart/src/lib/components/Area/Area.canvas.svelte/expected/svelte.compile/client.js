import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AreaBase from './Area.base.svelte';
import Path from '../Path/Path.canvas.svelte';
import Spline from '../Spline/Spline.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Area_canvas($$anchor, $$props) {
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