import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>hello</h1> <a href="/path-base/non-prerendered-page-and-endpoint/">page with a POST-only endpoint sibling</a>`);
}