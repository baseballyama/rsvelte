import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	let text = 'Hello World';

	function updateText() {
		text = 'Bye World';
	}

	$$renderer.push(`<!---->${$.escape(text)}`);
	$.bind_props($$props, { updateText });
}