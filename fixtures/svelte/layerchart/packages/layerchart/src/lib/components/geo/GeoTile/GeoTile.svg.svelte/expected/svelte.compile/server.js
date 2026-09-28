import * as $ from 'svelte/internal/server';
import GeoTileBase from './GeoTile.base.svelte';
import Group from '../../Group/Group.svg.svelte';
import TileImage from '../TileImage/TileImage.svg.svelte';

export default function GeoTile_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoTileBase($$renderer, $.spread_props([{ Group, TileImage }, props]));
}