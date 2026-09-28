import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let focused = false;

	function get_rest() {
		console.log("get_rest");

		return { "data-rest": "true" };
	}

	$$renderer.push(`<input${$.attributes({ class: `${focused ? 'focused' : ''}`, ...get_rest() }, void 0, { dark: true }, void 0, 4)}/>`);
}