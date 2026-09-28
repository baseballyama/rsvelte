import * as $ from 'svelte/internal/server';
import { createEventDispatcher, getContext } from "svelte";

export default function Inner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count } = $$props;
		const multiply = getContext('multiply');

		// Use legacy createEventDispatcher here to test that `events` property in `mount` works
		const dispatch = createEventDispatcher();

		$$renderer.push(`<button>${$.escape(count)}</button>`);
	});
}