import * as $ from 'svelte/internal/server';
import Expandable from './components/Expandable.svelte';

export default function CustomExpandable($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	Expandable($$renderer, $.spread_props([props]));
}