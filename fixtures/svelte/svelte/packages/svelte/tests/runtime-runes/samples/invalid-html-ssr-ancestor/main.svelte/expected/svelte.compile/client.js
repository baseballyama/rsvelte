import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Form from './form.svelte';

var root = $.from_html(`<form><div><!></div></form>`);

export default function Main($$anchor) {
	var form = root();
	var div = $.child(form);
	var node = $.child(div);

	Form(node, {});
	$.reset(div);
	$.reset(form);
	$.append($$anchor, form);
}