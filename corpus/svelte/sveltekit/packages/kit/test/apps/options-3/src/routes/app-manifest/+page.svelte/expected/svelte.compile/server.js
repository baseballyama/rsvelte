import * as $ from 'svelte/internal/server';
import { immutable } from '$app/manifest';

export default function _page($$renderer) {
	$$renderer.push(`<pre>${$.escape(JSON.stringify(immutable))}</pre>`);
}