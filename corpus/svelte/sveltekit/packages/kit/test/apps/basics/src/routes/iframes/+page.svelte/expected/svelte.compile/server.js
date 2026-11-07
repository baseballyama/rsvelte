import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="/iframes/nested/parent">parent</a>`);
}