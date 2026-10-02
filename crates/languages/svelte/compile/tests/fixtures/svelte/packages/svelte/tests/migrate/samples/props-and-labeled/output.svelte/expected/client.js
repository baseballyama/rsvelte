import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {any} readonly
	 * @property {string} [optional]
	 */
	/** @type {Props} */
	let optional = $.prop($$props, 'optional', 3, 'foo');

	let writable = $.derived(() => !$$props.readonly);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$$props.readonly ?? ''} ${optional() ?? ''} ${$.get(writable) ?? ''}`));
	$.append($$anchor, text);
}