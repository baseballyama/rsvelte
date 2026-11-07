import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<h1>404</h1> <blockquote class="svelte-1kntfxi"><p>Not Found</p> <p>Take me <a>home</a></p></blockquote>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var blockquote = $.sibling($.first_child(fragment), 2);
	var p = $.sibling($.child(blockquote), 2);
	var a = $.sibling($.child(p));

	$.reset(p);
	$.reset(blockquote);
	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => resolve('/')]);
	$.append($$anchor, fragment);
	$.pop();
}