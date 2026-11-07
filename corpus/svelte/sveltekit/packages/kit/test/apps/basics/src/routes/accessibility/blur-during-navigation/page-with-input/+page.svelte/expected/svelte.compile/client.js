import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Blur test</h1> <input id="blur-input"/> <a href="/accessibility/blur-during-navigation/other">Go to other</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	function handleBlur() {
		// Without the fix, data was already nulled when blur fired during
		// navigation, causing "Cannot read properties of undefined".
		// We write to window so the result survives component teardown.
		/** @type {any} */ window.__blur_test_result = $$props.data.message;
	}

	var fragment = root();
	var input = $.sibling($.first_child(fragment), 2);

	$.next(2);
	$.event('blur', input, handleBlur);
	$.append($$anchor, fragment);
	$.pop();
}