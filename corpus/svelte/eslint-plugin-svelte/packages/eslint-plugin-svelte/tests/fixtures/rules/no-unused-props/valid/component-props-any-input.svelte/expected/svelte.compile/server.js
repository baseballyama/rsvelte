import * as $ from 'svelte/internal/server';

export default function Component_props_any_input($$renderer, $$props) {
	let { a } = $$props;

	$$renderer.push(`<p>${$.escape(a)}</p>`);
}