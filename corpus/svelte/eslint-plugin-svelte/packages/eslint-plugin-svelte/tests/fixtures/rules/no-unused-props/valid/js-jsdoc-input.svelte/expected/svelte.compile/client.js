import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Js_jsdoc_input($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {string} name - User name
	 * @property {number} age - User age
	 */
	const props = $.rest_props($$props, rest_excludes);

	// JSDoc is not checked, so no warning
	console.log($$props.name);

	$.pop();
}