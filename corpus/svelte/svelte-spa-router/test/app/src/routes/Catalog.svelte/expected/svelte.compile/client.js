import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { link } from 'svelte-spa-router';

var root = $.from_html(`<h1 id="catalog"> </h1> <a id="previous" href="">Previous</a> <a id="next" href="">Next</a>`, 1);

export default function Catalog($$anchor, $$props) {
	$.push($$props, true);

	// Import the link action
	let id = $.derived(() => $$props.params && parseInt($$props.params.id, 10));

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var a = $.sibling(h1, 2);

	$.action(a, ($$node, $$action_arg) => link?.($$node, $$action_arg), () => `/catalog/${$.get(id) - 1}`);

	var a_1 = $.sibling(a, 2);

	$.action(a_1, ($$node, $$action_arg) => link?.($$node, $$action_arg), () => `/catalog/${$.get(id) + 1}`);
	$.template_effect(() => $.set_text(text, `Item ${$.get(id) ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}