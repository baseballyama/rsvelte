import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<h1 class="svelte-hcvrai">Page not found!</h1> <a class="svelte-hcvrai">Go to start page</a>`, 1);

export default function _error($$anchor) {
	var fragment = root();

	$.head('hcvrai', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Error';
		});
	});

	var a = $.sibling($.first_child(fragment), 2);

	$.template_effect(() => $.set_attribute(a, 'href', `${base ?? ''}/`));
	$.append($$anchor, fragment);
}