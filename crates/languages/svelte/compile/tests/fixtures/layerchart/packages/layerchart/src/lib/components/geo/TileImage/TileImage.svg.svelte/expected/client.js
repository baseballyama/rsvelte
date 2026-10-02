import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TileImageBase from './TileImage.base.svelte';
import Text from '../../Text/Text.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function TileImage_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	TileImageBase($$anchor, $.spread_props(
		{
			get Text() {
				return Text;
			}
		},
		() => props
	));
}