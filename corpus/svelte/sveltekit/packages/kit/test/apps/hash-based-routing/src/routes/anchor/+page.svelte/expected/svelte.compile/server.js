import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<a href="#test">go to #test</a> <p id="test">#test</p>`);
}