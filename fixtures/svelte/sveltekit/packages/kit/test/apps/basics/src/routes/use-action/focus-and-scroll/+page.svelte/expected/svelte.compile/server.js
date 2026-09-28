import * as $ from 'svelte/internal/server';
import { disableScrollHandling } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const focusAndScroll = /** @param {HTMLInputElement} node */ (node) => {
			disableScrollHandling();
			node.focus();
			node.scrollIntoView();
		};

		$$renderer.push(`<div>They (don't) see me scrollin'...</div> <div style="height: 180vh; background-color: peru;"><label for="input">Focus!</label> <input id="input" type="text"/></div> <div style="height: 180vh; background-color: teal;">They (not) focusin'</div>`);
	});
}