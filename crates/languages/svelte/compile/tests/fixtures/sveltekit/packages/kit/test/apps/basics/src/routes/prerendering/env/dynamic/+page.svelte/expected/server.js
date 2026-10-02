import * as $ from 'svelte/internal/server';
import { PUBLIC_PRERENDERING } from '$app/env/public';

export default function _page($$renderer) {
	$$renderer.push(`<h2>prerendering: ${$.escape(PUBLIC_PRERENDERING)}</h2>`);
}