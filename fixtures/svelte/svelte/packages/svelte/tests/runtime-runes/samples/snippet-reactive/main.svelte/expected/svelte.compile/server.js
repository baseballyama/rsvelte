import * as $ from 'svelte/internal/server';

function foo($$renderer) {
	$$renderer.push(`<p>foo</p>`);
}

function bar($$renderer) {
	$$renderer.push(`<p>bar</p>`);
}

export default function Main($$renderer) {
	let show_foo = true;
	let snippet = $.derived(() => show_foo ? foo : bar);

	snippet()($$renderer);
	$$renderer.push(`<!----> <button>show bar</button>`);
}