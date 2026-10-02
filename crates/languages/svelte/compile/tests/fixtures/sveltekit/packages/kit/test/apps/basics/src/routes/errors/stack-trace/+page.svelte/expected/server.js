import * as $ from 'svelte/internal/server';
import bad from './_bad.js';

export default function _page($$renderer) {
	$$renderer.push(`<h1>${$.escape(bad)}</h1>`);
}