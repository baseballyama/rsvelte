import * as $ from 'svelte/internal/server';
import { version } from '$app/env';

export default function _page($$renderer) {
	$$renderer.push(`<h1>${$.escape(version)}</h1>`);
}