import * as $ from 'svelte/internal/server';
import { PUBLIC_VALUE } from '$app/env/public';

export default function _page($$renderer) {
	$$renderer.push(`<h1>the fallback page was rendered</h1> <b>${$.escape(PUBLIC_VALUE)}</b>`);
}