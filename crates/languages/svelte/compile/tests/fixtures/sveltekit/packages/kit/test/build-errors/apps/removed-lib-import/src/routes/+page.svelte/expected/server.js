import * as $ from 'svelte/internal/server';
import '$lib/foo.js';

export default function _page($$renderer) {
	// @ts-expect-error this import intentionally fails
}