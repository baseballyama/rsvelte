import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} foo
	 */
	/** @type {Props & { [key: string]: any }} */
	let { foo, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<button${$.attributes({ foo, ...rest })}>click me</button>`);
}