import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { readable } from 'svelte/store';

var root = $.from_html(`<select><option disabled=""> </option><option>A</option><option>B</option></select>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const t = readable((/** @type {string} */ key) => key);
	let value = $.state('');
	var select = root();
	var option = $.child(select);
	var text = $.only_child(option, true);

	option.value = option.__value = '';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'a';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'b';
	$.reset(select);
	$.init_select(select);
	$.template_effect(($0) => $.set_text(text, $0), [() => $t()('placeholder')]);
	$.bind_select_value(select, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, select);
	$.pop();
	$$cleanup();
}