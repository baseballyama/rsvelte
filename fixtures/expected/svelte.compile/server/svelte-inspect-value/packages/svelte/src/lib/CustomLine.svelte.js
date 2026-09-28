import * as $ from 'svelte/internal/server';
import OneLineView from './components/OneLineView.svelte';

export default function CustomLine($$renderer, $$props) {
	let { type, $$slots, $$events, ...props } = $$props;

	OneLineView($$renderer, $.spread_props([{ type }, props]));
}