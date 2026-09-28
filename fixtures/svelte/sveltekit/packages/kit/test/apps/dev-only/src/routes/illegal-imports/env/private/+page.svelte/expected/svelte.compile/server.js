import * as $ from 'svelte/internal/server';
import { SHOULD_EXPLODE } from '$app/env/private';

export default function _page($$renderer) {
	$$renderer.push(`<p>${$.escape(SHOULD_EXPLODE)}</p>`);
}