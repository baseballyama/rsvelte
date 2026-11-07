import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable, readable, derived, get } from 'svelte/store';

var root = $.from_html(`<p> </p> <p> </p> <p> </p> <p> </p> <p> </p> <p> </p>`, 1);

export default function Test01_input($$anchor, $$props) {
	$.push($$props, true);

	const $storeValue1 = () => $.store_get(storeValue1, '$storeValue1', $$stores);
	const $storeValue2 = () => $.store_get(storeValue2, '$storeValue2', $$stores);
	const $storeValue3 = () => $.store_get(storeValue3, '$storeValue3', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const storeValue1 = writable('hello');
	const storeValue2 = readable('hello');
	const storeValue3 = derived(storeValue1, () => {});
	const numValue = 42;
	const strValue = 'string';
	let anyValue;
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);
	var p_3 = $.sibling(p_2, 2);
	var text_3 = $.only_child(p_3, true);
	var p_4 = $.sibling(p_3, 2);
	var text_4 = $.only_child(p_4, true);
	var p_5 = $.sibling(p_4, 2);
	var text_5 = $.only_child(p_5, true);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, $storeValue1());
			$.set_text(text_1, $0);
			$.set_text(text_2, $storeValue2());
			$.set_text(text_3, $1);
			$.set_text(text_4, $storeValue3());
			$.set_text(text_5, $2);
		},
		[
			() => get(storeValue1),
			() => get(storeValue2),
			() => get(storeValue3)
		]
	);

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}