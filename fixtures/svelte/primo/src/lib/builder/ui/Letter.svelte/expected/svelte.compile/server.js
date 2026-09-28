import * as $ from 'svelte/internal/server';

export default function Letter($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} [letter]
	 */
	/** @type {Props} */
	let { letter = 'b' } = $$props;

	$$renderer.push(`<span class="letter svelte-1hg97mq"><span class="inner-letter svelte-1hg97mq">${$.escape(letter)}</span></span>`);
}