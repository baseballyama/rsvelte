import * as $ from 'svelte/internal/server';
import CellBase from './Cell.base.svelte';
import Rect from '../Rect/Rect.canvas.svelte';
import Circle from '../Circle/Circle.canvas.svelte';
import Group from '../Group/Group.canvas.svelte';

export default function Cell_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	CellBase($$renderer, $.spread_props([{ Rect, Circle, Group }, props]));
}