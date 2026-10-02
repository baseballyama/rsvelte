import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function showCount() {
		return count;
	}

	$$renderer.push(`<!---->${$.escape(showCount``)} <button></button>`);
}