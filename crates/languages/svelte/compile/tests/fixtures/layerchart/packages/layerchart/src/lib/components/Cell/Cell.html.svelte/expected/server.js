import * as $ from 'svelte/internal/server';
import CellBase from './Cell.base.svelte';
import Rect from '../Rect/Rect.html.svelte';
import Circle from '../Circle/Circle.html.svelte';
import Group from '../Group/Group.html.svelte';

export default function Cell_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	CellBase($$renderer, $.spread_props([{ Rect, Circle, Group }, props]));
}