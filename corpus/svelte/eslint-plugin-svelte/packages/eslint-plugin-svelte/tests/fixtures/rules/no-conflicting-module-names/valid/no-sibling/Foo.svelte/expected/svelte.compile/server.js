import * as $ from 'svelte/internal/server';

export default function Foo($$renderer, $$props) {
	let { name } = $$props;

	$$renderer.push(`<p>${$.escape(name)}</p>`);
}