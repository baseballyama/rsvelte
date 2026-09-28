import * as $ from 'svelte/internal/server';
import { should_explode } from '#lib/server/blah/private.js';

export default function _page($$renderer) {
	$$renderer.push(`<p>${$.escape(should_explode)}</p>`);
}