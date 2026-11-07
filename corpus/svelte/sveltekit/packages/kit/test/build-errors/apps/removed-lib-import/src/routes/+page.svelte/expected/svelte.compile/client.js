import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '$lib/foo.js';

export default function _page($$anchor) {
	// @ts-expect-error this import intentionally fails
}