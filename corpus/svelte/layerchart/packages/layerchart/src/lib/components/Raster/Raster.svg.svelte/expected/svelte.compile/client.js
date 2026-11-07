import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RasterBase from './Raster.base.svelte';
import Image from '../Image/Image.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Raster_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	RasterBase($$anchor, $.spread_props(
		{
			get Image() {
				return Image;
			}
		},
		() => props
	));
}