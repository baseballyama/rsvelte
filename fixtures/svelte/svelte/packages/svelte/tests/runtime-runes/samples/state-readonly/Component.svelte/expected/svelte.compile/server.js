import * as $ from 'svelte/internal/server';
import Component2 from './Component2.svelte';

export default function Component($$renderer, $$props) {
	const { state } = $$props;

	function render(state) {
		return state;
	}

	Component2($$renderer, { state: render(state) });
}