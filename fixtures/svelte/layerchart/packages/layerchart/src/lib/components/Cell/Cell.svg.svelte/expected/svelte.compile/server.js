import * as $ from 'svelte/internal/server';
import CellBase from './Cell.base.svelte';
import Rect from '../Rect/Rect.svg.svelte';
import Circle from '../Circle/Circle.svg.svelte';
import Group from '../Group/Group.svg.svelte';

export default function Cell_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	CellBase($$renderer, $.spread_props([{ Rect, Circle, Group }, props]));
}