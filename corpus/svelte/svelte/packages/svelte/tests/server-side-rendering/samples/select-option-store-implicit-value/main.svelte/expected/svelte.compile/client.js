import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<select><option> </option><option>cat</option></select>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $value = () => $.store_get(value, '$value', $$stores);
	const $label = () => $.store_get(label, '$label', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const value = writable('dog');
	const label = writable('Dog');
	var select = root();
	var option = $.child(select);
	var text = $.only_child(option, true);
	var option_value = {};

	$.next();
	$.reset(select);
	$.init_select(select);

	$.template_effect(() => {
		$.set_text(text, $label());

		if (option_value !== (option_value = $label())) {
			option.__value = option_value;
		}
	});

	$.bind_select_value(select, $value, ($$value) => $.store_set(value, $$value));
	$.append($$anchor, select);
	$.pop();
	$$cleanup();
}