import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DensityBase from './Density.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Path from '../Path/Path.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Density_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	DensityBase($$anchor, $.spread_props(
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