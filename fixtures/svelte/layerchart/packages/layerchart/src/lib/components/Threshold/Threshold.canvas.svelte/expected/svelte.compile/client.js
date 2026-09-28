import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ThresholdBase from './Threshold.base.svelte';
import Area from '../Area/Area.canvas.svelte';
import ClipPath from '../ClipPath/ClipPath.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Threshold_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	ThresholdBase($$anchor, $.spread_props(
		{
			get Area() {
				return Area;
			},

			get ClipPath() {
				return ClipPath;
			}
		},
		() => props
	));
}