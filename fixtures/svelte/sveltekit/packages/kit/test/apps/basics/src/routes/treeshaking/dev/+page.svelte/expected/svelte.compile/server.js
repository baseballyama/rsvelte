import * as $ from 'svelte/internal/server';
import { dev } from '$app/env';

export default function _page($$renderer) {
	$$renderer.push(`<p>${$.escape(dev ? 'not prod' : 'prod')}</p> <p>negated: ${$.escape(!dev ? 'prod' : 'not prod')}</p>`);
}