import * as $ from 'svelte/internal/server';

export default function Image($$renderer, $$props) {
	let { src } = $$props;

	$$renderer.push(`<img${$.attr('src', src)}/>`);
}