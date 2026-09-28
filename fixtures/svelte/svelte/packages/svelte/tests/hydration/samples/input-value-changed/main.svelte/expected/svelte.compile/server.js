import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	const { name } = $$props;

	$$renderer.push(`<input type="text"${$.attr('value', name)}/>`);
}