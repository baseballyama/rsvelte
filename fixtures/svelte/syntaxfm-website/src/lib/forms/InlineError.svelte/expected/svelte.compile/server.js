import * as $ from 'svelte/internal/server';

export default function InlineError($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {any} displayError
	 */
	/** @type {Props} */
	let { displayError } = $$props;

	if (displayError) {
		$$renderer.push(`<!--[0--><p class="inline-error svelte-1fg5vg">${$.escape(displayError)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}