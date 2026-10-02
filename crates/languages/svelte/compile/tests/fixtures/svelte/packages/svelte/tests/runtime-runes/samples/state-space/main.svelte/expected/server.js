import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let text = '';

	function update_text() {
		text = 'updated';
	}

	$$renderer.push(`<button type="button">Update Text</button> <div>${$.escape(text)}</div>`);
}