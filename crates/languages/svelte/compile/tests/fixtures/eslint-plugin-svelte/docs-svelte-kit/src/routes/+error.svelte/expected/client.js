import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { page } from '$app/stores';

var root = $.from_html(`<h1> </h1> <blockquote><p> </p> <p>Take me <a>home</a></p></blockquote>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var blockquote = $.sibling(h1, 2);
	var p = $.child(blockquote);
	var text_1 = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var a = $.sibling($.child(p_1));

	$.reset(p_1);
	$.reset(blockquote);

	$.template_effect(
		($0) => {
			$.set_text(text, $page().status);
			$.set_text(text_1, $page().error.message);
			$.set_attribute(a, 'href', $0);
		},
		[() => resolve('/')]
	);

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}