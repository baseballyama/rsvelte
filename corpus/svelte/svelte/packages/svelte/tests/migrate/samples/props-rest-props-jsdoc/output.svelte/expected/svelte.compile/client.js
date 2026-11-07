import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'foo']);
var root = $.from_html(`<button>click me</button>`);

export default function Output($$anchor, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} foo
	 */
	/** @type {Props & { [key: string]: any }} */
	let rest = $.rest_props($$props, rest_excludes);

	var button = root();

	$.attribute_effect(button, () => ({ foo: $$props.foo, ...rest }));
	$.append($$anchor, button);
}