import * as $ from 'svelte/internal/server';
import GeoTileBase from './GeoTile.base.svelte';
import Group from '../../Group/Group.canvas.svelte';
import TileImage from '../TileImage/TileImage.canvas.svelte';

export default function GeoTile_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	GeoTileBase($$renderer, $.spread_props([{ Group, TileImage }, props]));
}