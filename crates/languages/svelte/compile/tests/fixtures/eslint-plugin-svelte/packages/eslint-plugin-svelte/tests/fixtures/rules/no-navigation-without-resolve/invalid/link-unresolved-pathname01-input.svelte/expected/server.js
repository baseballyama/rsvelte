import * as $ from 'svelte/internal/server';

export default function Link_unresolved_pathname01_input($$renderer, $$props) {
	const { href } = $$props;

	$$renderer.push(`<a${$.attr('href', href)}>Click me!</a>`);
}