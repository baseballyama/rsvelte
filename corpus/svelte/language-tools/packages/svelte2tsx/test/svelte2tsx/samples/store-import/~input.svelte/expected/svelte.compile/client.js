import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import storeA from './store';
import { storeB } from './store';
import { storeB as storeC } from './store';

var root = $.from_html(`<p> </p> <p> </p> <p> </p>`, 1);

export default function Input($$anchor) {
	const $storeA = () => $.store_get(storeA, '$storeA', $$stores);
	const $storeB = () => $.store_get(storeB, '$storeB', $$stores);
	const $storeC = () => $.store_get(storeC, '$storeC', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2, true);

	$.template_effect(() => {
		$.set_text(text, $storeA());
		$.set_text(text_1, $storeB());
		$.set_text(text_2, $storeC());
	});

	$.append($$anchor, fragment);
	$$cleanup();
}