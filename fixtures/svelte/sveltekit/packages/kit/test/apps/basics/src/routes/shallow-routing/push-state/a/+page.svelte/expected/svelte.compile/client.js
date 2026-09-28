import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { goto } from '$app/navigation';

var root = $.from_html(`<h1>a</h1> <p> </p> <span data-id="shallow"> </span> <button data-id="shallow-b">shallow to b</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(p);
	var span = $.sibling(p, 2);
	var text_1 = $.only_child(span, true);
	var button = $.sibling(span, 2);

	$.template_effect(() => {
		$.set_text(text, `active: ${page.state.active ?? false ?? ''}`);
		$.set_text(text_1, page.shallow ? page.shallow.url.pathname : 'null');
	});

	$.delegated('click', button, () => goto('/shallow-routing/push-state/b', { shallow: true, state: { active: true } }));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);