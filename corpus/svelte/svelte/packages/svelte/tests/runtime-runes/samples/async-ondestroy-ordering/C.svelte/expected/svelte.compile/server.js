import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { destroyed } from './destroyed.js';

export default function C($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onDestroy(() => destroyed.push('C'));
	});
}