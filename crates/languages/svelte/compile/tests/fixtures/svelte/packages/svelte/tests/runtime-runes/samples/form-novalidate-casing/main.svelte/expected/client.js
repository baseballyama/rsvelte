import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form></form> <form></form>`, 1);

export default function Main($$anchor) {
	let noValidate = true;
	var fragment = root();
	var form = $.first_child(fragment);

	form.noValidate = true;

	var form_1 = $.sibling(form, 2);

	form_1.noValidate = noValidate;
	$.append($$anchor, fragment);
}