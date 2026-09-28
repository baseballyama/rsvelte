import * as $ from 'svelte/internal/server';
import LabelsBase from './Labels.base.svelte';
import Text from '../Text/Text.svg.svelte';
import Group from '../Group/Group.svg.svelte';
import Points from '../Points/Points.svg.svelte';
import Link from '../Link/Link.svg.svelte';

export default function Labels_svg($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	LabelsBase($$renderer, $.spread_props([{ Text, Group, Points, Link }, props]));
}