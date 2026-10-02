import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p id="layout-throws-error-message"> </p>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Sibling error page (should not render): ${$$props.error.message ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}