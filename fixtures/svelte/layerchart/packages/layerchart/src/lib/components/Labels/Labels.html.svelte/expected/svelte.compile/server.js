import * as $ from 'svelte/internal/server';
import LabelsBase from './Labels.base.svelte';
import Text from '../Text/Text.html.svelte';
import Group from '../Group/Group.html.svelte';
import Points from '../Points/Points.html.svelte';

export default function Labels_html($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	LabelsBase($$renderer, $.spread_props([{ Text, Group, Points }, props]));
}