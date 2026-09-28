import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { browser } = $$props;

	$$renderer.push(`<img${$.attr('src', browser ? 'a' : 'b')} alt=""/>`);
}