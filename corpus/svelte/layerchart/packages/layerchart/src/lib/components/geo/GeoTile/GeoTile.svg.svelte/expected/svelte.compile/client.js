import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GeoTileBase from './GeoTile.base.svelte';
import Group from '../../Group/Group.svg.svelte';
import TileImage from '../TileImage/TileImage.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function GeoTile_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	GeoTileBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get TileImage() {
				return TileImage;
			}
		},
		() => props
	));
}