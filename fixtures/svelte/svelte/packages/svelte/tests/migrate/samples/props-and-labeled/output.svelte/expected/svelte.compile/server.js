import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {any} readonly
	 * @property {string} [optional]
	 */
	/** @type {Props} */
	let { readonly, optional = 'foo' } = $$props;

	let writable = $.derived(() => !readonly);

	$$renderer.push(`<!---->${$.escape(readonly)} ${$.escape(optional)} ${$.escape(writable())}`);
}