import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function get_handlers() {
		return {
			handle_click: () => {
				clicked = true;
			}
		};
	}

	let clicked = false;
	const { handle_click } = get_handlers();

	$$renderer.push(`<button>clicked: ${$.escape(clicked)}</button>`);
}