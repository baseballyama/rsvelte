import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<nav class="l-margin sticky zone svelte-9600io"><ul class="svelte-9600io"><li class="svelte-9600io"><a href="/system/colors">Colors</a></li> <li class="svelte-9600io"><a href="/system/layout">Layout</a></li> <li class="svelte-9600io"><a href="/system/typography">Typography</a></li> <li class="svelte-9600io"><a href="/system/theme">Theme</a></li></ul></nav> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
}