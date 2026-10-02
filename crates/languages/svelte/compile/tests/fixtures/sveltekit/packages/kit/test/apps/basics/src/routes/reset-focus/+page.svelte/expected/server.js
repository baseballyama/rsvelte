import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<button id="an:invalid+selector">I have a weird ID but I should be focused</button>`);
}