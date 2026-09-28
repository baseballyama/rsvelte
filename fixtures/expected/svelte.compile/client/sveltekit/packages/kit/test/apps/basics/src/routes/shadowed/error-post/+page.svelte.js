import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <h2> </h2>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	var /** @type {{ data: import('./$types').PageData, form: import('./$types').ActionData }} */
	h1 = $.first_child(fragment);

	var text = $.only_child(h1);
	var h2 = $.sibling(h1, 2);
	var text_1 = $.only_child(h2);

	$.template_effect(() => {
		$.set_text(text, `${$$props.data.get_message ?? ''} / ${$$props.form?.errors?.post_message ?? ''}`);
		$.set_text(text_1, `status: ${page.status ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
}