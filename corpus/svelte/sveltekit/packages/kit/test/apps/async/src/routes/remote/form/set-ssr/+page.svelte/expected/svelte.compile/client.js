import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { editData } from './form.remote';

var root = $.from_html(`<div id="description"> </div> <form><input/> <button type="submit">Submit</button></form>`, 1);

export default function _page($$anchor) {
	const form = editData;

	form.fields.set({ description: 'ssr' });
	form.fields.description.set('nested');

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var form_1 = $.sibling(div, 2);

	$.attribute_effect(form_1, () => ({ ...form }));

	var input = $.child(form_1);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => form.fields.name.as('text')], void 0, void 0, void 0, true);
	$.next(2);
	$.reset(form_1);
	$.template_effect(($0) => $.set_text(text, `Description: ${$0 ?? ''}`), [() => form.fields.description.value()]);
	$.append($$anchor, fragment);
}