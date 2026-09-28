import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { browser } = $$props;

	$$renderer.push(`<link${$.attr('href', browser ? '/foo' : '/bar')}/>`);
}