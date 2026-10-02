import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';

export default function Main($$renderer) {
	let tag = 'div';

	function toggle() {
		tag = tag ? null : 'div';
	}

	$$renderer.push(`<button id="button">toggle</button> TAG=${$.escape(tag)} <div id="container">`);

	$.element($$renderer, tag, void 0, () => {
		$$renderer.push(`CONTENT`);
	});

	$$renderer.push(`</div>`);
}