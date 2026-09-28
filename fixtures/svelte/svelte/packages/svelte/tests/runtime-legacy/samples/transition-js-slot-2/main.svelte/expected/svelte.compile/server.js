import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer, $$props) {
	let name = 'Foo';
	let visible = true;

	function show() {
		visible = true;
	}

	function hide() {
		visible = false;
		name = 'Bar';
	}

	Nested($$renderer, {
		visible,
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(name)}`);
		},
		$$slots: { default: true }
	});

	$.bind_props($$props, { show, hide });
}