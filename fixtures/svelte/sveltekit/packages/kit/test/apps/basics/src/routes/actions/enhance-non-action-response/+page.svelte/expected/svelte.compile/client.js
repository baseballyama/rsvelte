import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance } from '$app/forms';

var root = $.from_html(`<form method="POST" action="/actions/enhance-non-action-response/reject"><button class="json">Submit</button></form> <form method="POST" action="/actions/enhance-non-action-response/reject?body=html"><button class="html">Submit</button></form> <form method="POST" action="/actions/enhance-non-action-response/reject?body=empty"><button class="empty">Submit</button></form>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var form = $.first_child(fragment);

	$.action(form, ($$node) => enhance?.($$node));

	var form_1 = $.sibling(form, 2);

	$.action(form_1, ($$node) => enhance?.($$node));

	var form_2 = $.sibling(form_1, 2);

	$.action(form_2, ($$node) => enhance?.($$node));
	$.append($$anchor, fragment);
}