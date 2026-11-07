import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { src } = $$props;

	$$renderer.push(`<img${$.attr('src', src)} alt=""/>`);
}