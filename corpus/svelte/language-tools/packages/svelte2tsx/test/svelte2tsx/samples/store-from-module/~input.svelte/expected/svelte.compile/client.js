import 'svelte/internal/disclose-version';
import { store1, store2 } from './store';
import * as $ from 'svelte/internal/client';

const store3 = writable('');
const store4 = writable('');
var root = $.from_html(`<p> </p> <p> </p>`, 1);

export default function Input($$anchor) {
	const $store1 = () => $.store_get(store1, '$store1', $$stores);
	const $store3 = () => $.store_get(store3, '$store3', $$stores);
	const $store2 = () => $.store_get(store2, '$store2', $$stores);
	const $store4 = () => $.store_get(store4, '$store4', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$store1();
	$store3();

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(() => {
		$.set_text(text, $store2());
		$.set_text(text_1, $store4());
	});

	$.append($$anchor, fragment);
	$$cleanup();
}