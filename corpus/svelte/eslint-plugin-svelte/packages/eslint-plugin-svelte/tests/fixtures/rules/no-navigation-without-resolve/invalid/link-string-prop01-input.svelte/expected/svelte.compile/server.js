import * as $ from 'svelte/internal/server';

export default function Link_string_prop01_input($$renderer, $$props) {
	const { href } = $$props;

	$$renderer.push(`<a${$.attr('href', href)}>Click me!</a>`);
}