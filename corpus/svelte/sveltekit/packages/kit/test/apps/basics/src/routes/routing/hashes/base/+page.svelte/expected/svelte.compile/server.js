import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a id="navigate" href="/routing/hashes/base/a#x">navigate</a>`);
}