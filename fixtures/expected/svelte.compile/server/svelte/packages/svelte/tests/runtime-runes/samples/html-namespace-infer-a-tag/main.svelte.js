import * as $ from 'svelte/internal/server';
import Div from './div.svelte';

export default function Main($$renderer) {
	function test($$renderer) {
		$$renderer.push(`<a><span>Hello</span></a>`);
	}

	$$renderer.push(`<div><a><span>Hello</span></a></div> <div>`);
	test($$renderer);
	$$renderer.push(`<!----></div> `);

	Div($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<a><span>Hello</span></a>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}