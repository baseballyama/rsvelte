import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var /**
	 * @typedef {Object} Props
	 * @property {any} data
	 */
	/** @type {Props} */
	div = root();

	$.html(div, () => $$props.data.props.html, true);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}