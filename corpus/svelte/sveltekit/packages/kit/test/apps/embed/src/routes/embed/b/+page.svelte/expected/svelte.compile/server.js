import * as $ from 'svelte/internal/server';
import { browser } from '$app/env';

export default function _page($$renderer) {
	$$renderer.push(`<h2 data-testid="b">b (${$.escape(browser ? 'browser' : 'server')})</h2>`);
}