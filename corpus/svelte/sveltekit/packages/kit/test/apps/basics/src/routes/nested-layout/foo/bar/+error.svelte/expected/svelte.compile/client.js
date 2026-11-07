import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1 class="svelte-7gf7tk">Nested error page</h1> <p id="nested-error-status"> </p> <p id="nested-error-message"> </p>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);

	$.template_effect(() => {
		$.set_text(text, `status: ${page.status ?? ''}`);
		$.set_text(text_1, `error.message: ${page.error?.message ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
}