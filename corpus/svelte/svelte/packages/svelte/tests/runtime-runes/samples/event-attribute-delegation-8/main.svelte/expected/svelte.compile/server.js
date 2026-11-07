import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function onclick() {}

		$$renderer.push(`<div id="app"><button>click me</button></div>`);
	});
}