import * as $ from 'svelte/internal/server';
import { browser } from '$app/env';

export default function _page($$renderer) {
	$$renderer.push(`<p>${$.escape(browser ? 'client' : 'server')}</p> <p>negated: ${$.escape(!browser ? 'server' : 'client')}</p>`);
}