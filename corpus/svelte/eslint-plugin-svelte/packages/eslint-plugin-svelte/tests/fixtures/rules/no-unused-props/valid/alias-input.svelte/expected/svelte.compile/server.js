import * as $ from 'svelte/internal/server';

export default function Alias_input($$renderer, $$props) {
	const { test, 'aria-label': ariaLabel } = $$props;

	$$renderer.push(`<h1>${$.escape(test)}</h1> <div${$.attr('aria-label', ariaLabel)}>svelte/no-unused-props does not always respect aliases</div>`);
}