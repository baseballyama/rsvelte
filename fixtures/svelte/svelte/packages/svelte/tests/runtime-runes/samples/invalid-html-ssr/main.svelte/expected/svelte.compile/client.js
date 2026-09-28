import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Form from './form.svelte';
import H1 from './h1.svelte';

var root = $.from_html(`<p><!></p> <form><!></form>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var p = $.first_child(fragment);
	var node = $.child(p);

	H1(node, {});
	$.reset(p);

	var form = $.sibling(p, 2);
	var node_1 = $.child(form);

	Form(node_1, {});
	$.reset(form);
	$.append($$anchor, fragment);
}