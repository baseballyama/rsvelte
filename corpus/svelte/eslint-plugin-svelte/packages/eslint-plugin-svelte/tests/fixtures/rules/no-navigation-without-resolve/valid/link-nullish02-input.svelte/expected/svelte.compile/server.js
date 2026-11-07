import * as $ from 'svelte/internal/server';

export default function Link_nullish02_input($$renderer, $$props) {
	const { one, two, href } = $$props;

	$$renderer.push(`<a${$.attr('href', one)}>Click me!</a> <a${$.attr('href', two)}>Click me!</a> <a${$.attr('href', href)}>Click me!</a>`);
}