import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="letter svelte-1hg97mq"><span class="inner-letter svelte-1hg97mq"> </span></span>`);

export default function Letter($$anchor, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {string} [letter]
	 */
	/** @type {Props} */
	let letter = $.prop($$props, 'letter', 3, 'b');

	var span = root();
	var span_1 = $.child(span);
	var text = $.only_child(span_1, true);

	$.reset(span);
	$.template_effect(() => $.set_text(text, letter()));
	$.append($$anchor, span);
}