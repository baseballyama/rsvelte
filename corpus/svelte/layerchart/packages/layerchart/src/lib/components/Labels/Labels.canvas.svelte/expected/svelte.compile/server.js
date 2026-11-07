import * as $ from 'svelte/internal/server';
import LabelsBase from './Labels.base.svelte';
import Text from '../Text/Text.canvas.svelte';
import Group from '../Group/Group.canvas.svelte';
import Points from '../Points/Points.canvas.svelte';
import Link from '../Link/Link.canvas.svelte';

export default function Labels_canvas($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	LabelsBase($$renderer, $.spread_props([{ Text, Group, Points, Link }, props]));
}