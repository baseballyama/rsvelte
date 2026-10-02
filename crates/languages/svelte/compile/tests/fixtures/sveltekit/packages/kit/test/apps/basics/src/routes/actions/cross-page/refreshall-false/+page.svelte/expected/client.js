import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance } from '$app/forms';

var root = $.from_html(`<h1 class="source">source (refreshAll: false)</h1> <form method="POST" action="/actions/cross-page/destination?/success"><input name="username" type="text" value="paolo"/> <button class="submit-success">Submit</button></form>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var form = $.sibling($.first_child(fragment), 2);

	$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), () => () => async ({ update }) => {
		await update({ refreshAll: false });
	});

	$.append($$anchor, fragment);
}