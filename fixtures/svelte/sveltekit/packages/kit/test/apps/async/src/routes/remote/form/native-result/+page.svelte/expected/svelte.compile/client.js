import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { echo } from './form.remote';

var root = $.from_html(`<div id="hydrated"> </div> <div id="result"> </div> <div id="issue"> </div> <div id="keyed-result"> </div> <div id="keyed-slash-result"> </div> <form id="plain" method="POST"><input/> <button type="submit">Submit</button></form> <form id="keyed" method="POST"><input/> <button type="submit">Submit</button></form> <form id="keyed-slash" method="POST"><input/> <button type="submit">Submit</button></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// a key with a space forces the encoded (server) and raw (client) id conventions to diverge
	const keyed = echo.for('a b');

	// a key with a slash must not break the `?/remote=` id parsing on the server
	const keyed_slash = echo.for('a/b');

	let hydrated = $.state(false);

	onMount(() => {
		$.set(hydrated, true);
	});

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2, true);
	var div_3 = $.sibling(div_2, 2);
	var text_3 = $.only_child(div_3, true);
	var div_4 = $.sibling(div_3, 2);
	var text_4 = $.only_child(div_4, true);
	var form = $.sibling(div_4, 2);
	var input = $.child(form);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => echo.fields.message.as('text')], void 0, void 0, void 0, true);
	$.next(2);
	$.reset(form);

	var form_1 = $.sibling(form, 2);
	var input_1 = $.child(form_1);

	$.attribute_effect(input_1, ($0) => ({ ...$0 }), [() => keyed.fields.message.as('text')], void 0, void 0, void 0, true);
	$.next(2);
	$.reset(form_1);

	var form_2 = $.sibling(form_1, 2);
	var input_2 = $.child(form_2);

	$.attribute_effect(input_2, ($0) => ({ ...$0 }), [() => keyed_slash.fields.message.as('text')], void 0, void 0, void 0, true);
	$.next(2);
	$.reset(form_2);

	$.template_effect(
		($0) => {
			$.set_text(text, $.get(hydrated));
			$.set_text(text_1, echo.result ?? 'none');
			$.set_text(text_2, $0);
			$.set_text(text_3, keyed.result ?? 'none');
			$.set_text(text_4, keyed_slash.result ?? 'none');
			$.set_attribute(form, 'action', echo.action);
			$.set_attribute(form_1, 'action', keyed.action);
			$.set_attribute(form_2, 'action', keyed_slash.action);
		},
		[
			() => echo.fields.message.issues()?.[0]?.message ?? 'no issues'
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}