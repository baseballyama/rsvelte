import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let x = void 0;

	function foo() {
		return true;
	}

	$$renderer.push(`<!---->`);
	$.bind_props($$props, { foo });
}